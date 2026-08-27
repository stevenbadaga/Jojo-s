package com.kitenge.service;

import com.kitenge.dto.BusinessStats;
import com.kitenge.model.Order;
import com.kitenge.model.Product;
import com.kitenge.model.User;
import com.kitenge.repository.OrderRepository;
import com.kitenge.repository.ProductRepository;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {
    
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    
    public BusinessStats getBusinessStats() {
        // Products
        List<Product> allProducts = productRepository.findAll();
        long totalProducts = allProducts.size();
        long activeProducts = allProducts.stream()
                .filter(p -> p.getActive() != null && p.getActive())
                .count();
        
        // Orders
        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();
        
        // Revenue calculations
        long totalRevenue = allOrders.stream()
                .mapToLong(o -> (o.getSubtotal() != null ? o.getSubtotal() : 0) + 
                               (o.getDeliveryFee() != null ? o.getDeliveryFee() : 0))
                .sum();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() % 7)
                .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
        
        long monthlyRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfMonth))
                .mapToLong(o -> (o.getSubtotal() != null ? o.getSubtotal() : 0) + 
                               (o.getDeliveryFee() != null ? o.getDeliveryFee() : 0))
                .sum();
        
        long weeklyRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfWeek))
                .mapToLong(o -> (o.getSubtotal() != null ? o.getSubtotal() : 0) + 
                               (o.getDeliveryFee() != null ? o.getDeliveryFee() : 0))
                .sum();
        
        long todayRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfDay))
                .mapToLong(o -> (o.getSubtotal() != null ? o.getSubtotal() : 0) + 
                               (o.getDeliveryFee() != null ? o.getDeliveryFee() : 0))
                .sum();
        
        // Customers
        List<User> allUsers = userRepository.findAll();
        long totalCustomers = allUsers.size();
        
        // Orders by status (if status field exists)
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("all", (long) allOrders.size());
        
        // Revenue by month (last 6 months)
        Map<String, Long> revenueByMonth = new HashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1)
                    .withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            long monthRevenue = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && 
                               o.getCreatedAt().isAfter(monthStart) && 
                               o.getCreatedAt().isBefore(monthEnd))
                    .mapToLong(o -> (o.getSubtotal() != null ? o.getSubtotal() : 0) + 
                                   (o.getDeliveryFee() != null ? o.getDeliveryFee() : 0))
                    .sum();
            
            String monthKey = monthStart.getMonth().toString() + " " + monthStart.getYear();
            revenueByMonth.put(monthKey, monthRevenue);
        }
        
        BusinessStats stats = new BusinessStats();
        stats.setTotalProducts(totalProducts);
        stats.setActiveProducts(activeProducts);
        stats.setTotalOrders(totalOrders);
        stats.setTotalRevenue(totalRevenue);
        stats.setMonthlyRevenue(monthlyRevenue);
        stats.setWeeklyRevenue(weeklyRevenue);
        stats.setTodayRevenue(todayRevenue);
        stats.setTotalCustomers(totalCustomers);
        stats.setOrdersByStatus(ordersByStatus);
        stats.setRevenueByMonth(revenueByMonth);
        
        return stats;
    }
}

