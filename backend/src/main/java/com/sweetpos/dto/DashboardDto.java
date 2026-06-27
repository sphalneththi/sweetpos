package com.sweetpos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private BigDecimal todayRevenue;
    private long todayTransactions;
    private BigDecimal todayTax;
    private BigDecimal todayDiscount;
    private List<TopProductItem> topProducts;
    private List<CashierSummary> cashierSummary;
    private List<LowStockItem> lowStockAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductItem {
        private String name;
        private long quantity;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashierSummary {
        private String name;
        private long transactions;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockItem {
        private String productName;
        private int currentStock;
        private int minStock;
    }
}
