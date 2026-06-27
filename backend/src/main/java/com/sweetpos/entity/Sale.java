package com.sweetpos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale extends BaseEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String invoiceNumber;

    @Column(length = 50)
    private String terminalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id", nullable = false)
    private User cashier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(length = 20)
    private String discountType;

    @Column(precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(precision = 14, scale = 2)
    private BigDecimal cashReceived;

    @Column(precision = 14, scale = 2)
    private BigDecimal changeAmount;

    @Column(nullable = false)
    @Builder.Default
    private int loyaltyEarned = 0;

    @Column(nullable = false)
    @Builder.Default
    private int loyaltyRedeemed = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SaleStatus status = SaleStatus.COMPLETED;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SaleItem> items = new ArrayList<>();

    // Used for sync
    @Column(length = 100)
    private String localId;

    public enum PaymentMethod {
        CASH, CARD, QR, MIXED
    }

    public enum SaleStatus {
        COMPLETED, CANCELLED, REFUNDED, PENDING_SYNC
    }
}
