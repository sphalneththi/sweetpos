package com.sweetpos.service;

import com.sweetpos.dto.DashboardDto;
import com.sweetpos.repository.ProductRepository;
import com.sweetpos.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public DashboardDto getDashboard() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);

        Object[] summary = saleRepository.getDailySummary(start, end);

        long transactions = summary[0] != null ? ((Number) summary[0]).longValue() : 0L;
        BigDecimal revenue = summary[1] != null ? new BigDecimal(summary[1].toString()) : BigDecimal.ZERO;
        BigDecimal tax = summary[2] != null ? new BigDecimal(summary[2].toString()) : BigDecimal.ZERO;
        BigDecimal discount = summary[3] != null ? new BigDecimal(summary[3].toString()) : BigDecimal.ZERO;

        // Top products
        List<Object[]> topProductsRaw = saleRepository.getTopProducts(start, end);
        List<DashboardDto.TopProductItem> topProducts = topProductsRaw.stream()
                .map(row -> DashboardDto.TopProductItem.builder()
                        .name((String) row[0])
                        .quantity(((Number) row[1]).longValue())
                        .revenue(new BigDecimal(row[2].toString()))
                        .build())
                .toList();

        // Cashier summary
        List<Object[]> cashierRaw = saleRepository.getSalesByCashier(start, end);
        List<DashboardDto.CashierSummary> cashierSummary = cashierRaw.stream()
                .map(row -> DashboardDto.CashierSummary.builder()
                        .name((String) row[1])
                        .transactions(((Number) row[2]).longValue())
                        .revenue(new BigDecimal(row[3].toString()))
                        .build())
                .toList();

        // Low stock
        var lowStockProducts = productRepository.findByActiveTrueAndStockQuantityLessThanEqual(5);
        List<DashboardDto.LowStockItem> lowStock = lowStockProducts.stream()
                .map(p -> DashboardDto.LowStockItem.builder()
                        .productName(p.getName())
                        .currentStock(p.getStockQuantity())
                        .minStock(p.getMinStockLevel())
                        .build())
                .toList();

        return DashboardDto.builder()
                .todayRevenue(revenue)
                .todayTransactions(transactions)
                .todayTax(tax)
                .todayDiscount(discount)
                .topProducts(topProducts)
                .cashierSummary(cashierSummary)
                .lowStockAlerts(lowStock)
                .build();
    }
}
