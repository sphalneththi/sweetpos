package com.sweetpos.controller;

import com.sweetpos.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
public class ReportController {

    private final SaleService saleService;

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> salesReport(
            @RequestParam String from,
            @RequestParam String to) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);

        var sales = saleService.findByDateRange(fromDate, toDate);
        var topProducts = saleService.getTopProducts(fromDate, toDate);

        Map<String, Object> report = new HashMap<>();
        report.put("sales", sales);
        report.put("totalSales", sales.size());
        report.put("topProducts", topProducts.stream().map(row -> Map.of(
                "name", row[0], "quantity", row[1], "revenue", row[2]
        )).toList());

        return ResponseEntity.ok(report);
    }
}
