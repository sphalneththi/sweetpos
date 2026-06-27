package com.sweetpos.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateSaleRequest {
    private UUID customerId;
    private String terminalId;

    @NotEmpty
    private List<SaleItemRequest> items;

    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;

    @NotNull
    private String paymentMethod; // CASH, CARD, QR, MIXED

    private BigDecimal cashReceived;
    private Integer loyaltyRedeemed;
    private String notes;

    // For offline sync: the local ID assigned by the Flutter app
    private String localId;

    @Data
    public static class SaleItemRequest {
        @NotNull
        private UUID productId;
        @NotNull
        private Integer quantity;
        private BigDecimal discountAmount;
    }
}
