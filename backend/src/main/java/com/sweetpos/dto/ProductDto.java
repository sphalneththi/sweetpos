package com.sweetpos.dto;

import com.sweetpos.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private UUID id;
    private String name;
    private String description;
    private String barcode;
    private String sku;
    private UUID categoryId;
    private String categoryName;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal taxRate;
    private int stockQuantity;
    private int minStockLevel;
    private String unit;
    private String imageUrl;
    private boolean active;
    private boolean trackInventory;

    public static ProductDto from(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .barcode(p.getBarcode())
                .sku(p.getSku())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .costPrice(p.getCostPrice())
                .sellingPrice(p.getSellingPrice())
                .taxRate(p.getTaxRate())
                .stockQuantity(p.getStockQuantity())
                .minStockLevel(p.getMinStockLevel())
                .unit(p.getUnit())
                .imageUrl(p.getImageUrl())
                .active(p.isActive())
                .trackInventory(p.isTrackInventory())
                .build();
    }
}
