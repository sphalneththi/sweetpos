package com.sweetpos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateProductRequest {
    @NotBlank
    private String name;
    private String description;
    private String barcode;
    private String sku;
    private UUID categoryId;

    @NotNull
    @Positive
    private BigDecimal costPrice;

    @NotNull
    @Positive
    private BigDecimal sellingPrice;

    private BigDecimal taxRate;
    private Integer stockQuantity;
    private Integer minStockLevel;
    private String unit;
    private String imageUrl;
    private Boolean trackInventory;
}
