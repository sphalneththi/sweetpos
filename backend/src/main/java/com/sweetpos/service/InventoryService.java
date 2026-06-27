package com.sweetpos.service;

import com.sweetpos.entity.InventoryMovement;
import com.sweetpos.repository.InventoryMovementRepository;
import com.sweetpos.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;

    public Page<InventoryMovement> findAll(int page, int size) {
        return movementRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InventoryMovement> findByProduct(UUID productId, int page, int size) {
        return movementRepository.findByProductIdOrderByCreatedAtDesc(productId, PageRequest.of(page, size));
    }

    @Transactional
    public InventoryMovement recordMovement(UUID productId, InventoryMovement.MovementType type,
                                            int quantity, String reference, String reason,
                                            UUID userId, UUID supplierId) {
        InventoryMovement movement = InventoryMovement.builder()
                .productId(productId)
                .type(type)
                .quantity(quantity)
                .reference(reference)
                .reason(reason)
                .userId(userId)
                .supplierId(supplierId)
                .build();

        return movementRepository.save(movement);
    }

    @Transactional
    public InventoryMovement stockIn(UUID productId, int quantity, String reference,
                                     String reason, UUID userId, UUID supplierId) {
        productRepository.adjustStock(productId, quantity);
        return recordMovement(productId, InventoryMovement.MovementType.STOCK_IN,
                quantity, reference, reason, userId, supplierId);
    }

    @Transactional
    public InventoryMovement stockOut(UUID productId, int quantity, String reference,
                                      String reason, UUID userId) {
        productRepository.adjustStock(productId, -quantity);
        return recordMovement(productId, InventoryMovement.MovementType.STOCK_OUT,
                -quantity, reference, reason, userId, null);
    }

    @Transactional
    public InventoryMovement adjustment(UUID productId, int newQuantity, String reason, UUID userId) {
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        int diff = newQuantity - product.getStockQuantity();
        product.setStockQuantity(newQuantity);
        productRepository.save(product);
        return recordMovement(productId, InventoryMovement.MovementType.ADJUSTMENT,
                diff, null, reason, userId, null);
    }
}
