package com.sweetpos.service;

import com.sweetpos.dto.CreateSaleRequest;
import com.sweetpos.entity.*;
import com.sweetpos.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductService productService;
    private final CustomerService customerService;
    private final InventoryService inventoryService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Sale create(CreateSaleRequest request, UUID cashierId) {
        // Check for duplicate sync (idempotency)
        if (request.getLocalId() != null) {
            var existing = saleRepository.findByLocalId(request.getLocalId());
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (var itemReq : request.getItems()) {
            Product product = productService.getEntity(itemReq.getProductId());
            if (product.isTrackInventory() && product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName());
            }

            BigDecimal lineTotal = product.getSellingPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            BigDecimal discount = itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO;
            lineTotal = lineTotal.subtract(discount);
            BigDecimal tax = lineTotal.multiply(product.getTaxRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(lineTotal);

            SaleItem saleItem = SaleItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productBarcode(product.getBarcode())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .costPrice(product.getCostPrice())
                    .discountAmount(discount)
                    .taxAmount(tax)
                    .totalPrice(lineTotal)
                    .build();
            saleItems.add(saleItem);
        }

        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = saleItems.stream()
                .map(SaleItem::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int loyaltyRedeemed = request.getLoyaltyRedeemed() != null ? request.getLoyaltyRedeemed() : 0;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(taxAmount)
                .subtract(BigDecimal.valueOf(loyaltyRedeemed));

        BigDecimal cashReceived = request.getCashReceived();
        BigDecimal changeAmount = null;
        if (cashReceived != null) {
            changeAmount = cashReceived.subtract(totalAmount).max(BigDecimal.ZERO);
        }

        int loyaltyEarned = totalAmount.divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR).intValue();

        String invoiceNumber = generateInvoiceNumber();

        User cashierRef = new User();
        cashierRef.setId(cashierId);

        Customer customerRef = null;
        if (request.getCustomerId() != null) {
            customerRef = new Customer();
            customerRef.setId(request.getCustomerId());
        }

        Sale sale = Sale.builder()
                .invoiceNumber(invoiceNumber)
                .terminalId(request.getTerminalId() != null ? request.getTerminalId() : "WEB-01")
                .cashier(cashierRef)
                .customer(customerRef)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .paymentMethod(Sale.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .cashReceived(cashReceived)
                .changeAmount(changeAmount)
                .loyaltyEarned(loyaltyEarned)
                .loyaltyRedeemed(loyaltyRedeemed)
                .status(Sale.SaleStatus.COMPLETED)
                .notes(request.getNotes())
                .localId(request.getLocalId())
                .items(new ArrayList<>())
                .build();

        Sale savedSale = saleRepository.save(sale);

        for (SaleItem item : saleItems) {
            item.setSale(savedSale);
            savedSale.getItems().add(item);
        }
        saleRepository.save(savedSale);

        // Deduct stock
        for (var itemReq : request.getItems()) {
            productService.adjustStock(itemReq.getProductId(), -itemReq.getQuantity());
            inventoryService.recordMovement(itemReq.getProductId(),
                    InventoryMovement.MovementType.SALE, -itemReq.getQuantity(),
                    invoiceNumber, "Sale: " + invoiceNumber, cashierId, null);
        }

        // Update customer loyalty
        if (request.getCustomerId() != null) {
            try {
                customerService.addLoyaltyPoints(request.getCustomerId(), loyaltyEarned, totalAmount);
                if (loyaltyRedeemed > 0) {
                    customerService.redeemLoyaltyPoints(request.getCustomerId(), loyaltyRedeemed);
                }
            } catch (Exception e) {
                // Loyalty failure should not block sale
            }
        }

        // Broadcast to admin portal via WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/sales", Map.of(
                    "type", "NEW_SALE",
                    "invoiceNumber", invoiceNumber,
                    "amount", totalAmount,
                    "timestamp", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            // WebSocket failure should not block sale
        }

        return savedSale;
    }

    public Page<Sale> findAll(int page, int size) {
        return saleRepository.findAll(PageRequest.of(page, size));
    }

    public Sale findById(UUID id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));
    }

    public List<Sale> findByDateRange(LocalDate from, LocalDate to) {
        return saleRepository.findByDateRange(
                from.atStartOfDay(),
                to.atTime(LocalTime.MAX));
    }

    @Transactional
    public Sale cancel(UUID saleId, UUID userId) {
        Sale sale = findById(saleId);
        if (sale.getStatus() != Sale.SaleStatus.COMPLETED) {
            throw new RuntimeException("Only completed sales can be cancelled");
        }
        sale.setStatus(Sale.SaleStatus.CANCELLED);
        saleRepository.save(sale);

        // Restock items
        for (SaleItem item : sale.getItems()) {
            productService.adjustStock(item.getProductId(), item.getQuantity());
            inventoryService.recordMovement(item.getProductId(),
                    InventoryMovement.MovementType.RETURN, item.getQuantity(),
                    sale.getInvoiceNumber(), "Cancelled sale", userId, null);
        }

        return sale;
    }

    public Map<String, Object> getDailySummary(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        Object[] result = saleRepository.getDailySummary(start, end);
        return Map.of(
                "count", result[0] != null ? result[0] : 0L,
                "revenue", result[1] != null ? result[1] : BigDecimal.ZERO,
                "tax", result[2] != null ? result[2] : BigDecimal.ZERO,
                "discount", result[3] != null ? result[3] : BigDecimal.ZERO
        );
    }

    public List<Object[]> getTopProducts(LocalDate from, LocalDate to) {
        return saleRepository.getTopProducts(from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }

    private String generateInvoiceNumber() {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = saleRepository.count();
        return prefix + "-" + String.format("%04d", count + 1);
    }
}
