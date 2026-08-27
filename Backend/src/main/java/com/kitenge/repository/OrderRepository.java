package com.kitenge.repository;

import com.kitenge.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerNameIgnoreCase(String customerName);
    List<Order> findByCustomerPhone(String customerPhone);
    List<Order> findByUserId(Long userId);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findTopByOrderNumberAndCustomerPhoneOrderByCreatedAtDesc(Integer orderNumber, String customerPhone);
    List<Order> findByOrderNumberOrderByCreatedAtDesc(Integer orderNumber);
    
    // Find the last order number for the current month
    @Query("SELECT MAX(o.orderNumber) FROM Order o WHERE YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month")
    Optional<Integer> findLastOrderNumberForMonth(@Param("year") int year, @Param("month") int month);
}

