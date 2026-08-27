package com.kitenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessStats {
    private Long totalProducts;
    private Long activeProducts;
    private Long totalOrders;
    private Long totalRevenue;
    private Long monthlyRevenue;
    private Long weeklyRevenue;
    private Long todayRevenue;
    private Long totalCustomers;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> revenueByMonth;
}

