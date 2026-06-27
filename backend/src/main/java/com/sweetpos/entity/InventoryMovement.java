package com.sweetpos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovement extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovementType type;

    @Column(nullable = false)
    private int quantity;

    @Column(length = 50)
    private String reference;

    @Column(length = 500)
    private String reason;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    public enum MovementType {
        STOCK_IN, STOCK_OUT, ADJUSTMENT, SALE, RETURN
    }
}
