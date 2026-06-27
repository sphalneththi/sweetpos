package com.sweetpos.repository;

import com.sweetpos.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SaleRepository extends JpaRepository<Sale, UUID> {

    Page<Sale> findByStatusOrderByCreatedAtDesc(Sale.SaleStatus status, Pageable pageable);

    @Query("SELECT s FROM Sale s WHERE s.createdAt BETWEEN :start AND :end ORDER BY s.createdAt DESC")
    List<Sale> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s), SUM(s.totalAmount), SUM(s.taxAmount), SUM(s.discountAmount) " +
           "FROM Sale s WHERE s.status = 'COMPLETED' AND s.createdAt BETWEEN :start AND :end")
    Object[] getDailySummary(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.cashier.id, s.cashier.fullName, COUNT(s), SUM(s.totalAmount) " +
           "FROM Sale s WHERE s.status = 'COMPLETED' AND s.createdAt BETWEEN :start AND :end " +
           "GROUP BY s.cashier.id, s.cashier.fullName")
    List<Object[]> getSalesByCashier(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT si.product_name, SUM(si.quantity) as qty, SUM(si.total_price) as rev " +
           "FROM sale_items si JOIN sales s ON si.sale_id = s.id " +
           "WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN :start AND :end " +
           "GROUP BY si.product_name ORDER BY rev DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getTopProducts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    Optional<Sale> findByLocalId(String localId);

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);
}
