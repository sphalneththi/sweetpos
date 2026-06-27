package com.sweetpos.controller;

import com.sweetpos.entity.InventoryMovement;
import com.sweetpos.entity.User;
import com.sweetpos.service.InventoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Page<InventoryMovement>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(inventoryService.findAll(page, size));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<InventoryMovement>> findByProduct(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(inventoryService.findByProduct(productId, page, size));
    }

    @PostMapping("/stock-in")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryMovement> stockIn(@RequestBody StockRequest request,
                                                     @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(inventoryService.stockIn(
                request.getProductId(), request.getQuantity(),
                request.getReference(), request.getReason(),
                user.getId(), request.getSupplierId()));
    }

    @PostMapping("/stock-out")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryMovement> stockOut(@RequestBody StockRequest request,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(inventoryService.stockOut(
                request.getProductId(), request.getQuantity(),
                request.getReference(), request.getReason(), user.getId()));
    }

    @PostMapping("/adjustment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryMovement> adjustment(@RequestBody StockRequest request,
                                                         @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(inventoryService.adjustment(
                request.getProductId(), request.getQuantity(),
                request.getReason(), user.getId()));
    }

    @Data
    public static class StockRequest {
        private UUID productId;
        private int quantity;
        private String reference;
        private String reason;
        private UUID supplierId;
    }
}
