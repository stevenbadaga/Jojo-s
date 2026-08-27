package com.kitenge.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_number")
    @JsonProperty("order_number")
    private Integer orderNumber; // Monthly sequential order number (resets each month)
    
    @Column(name = "customer_name")
    @JsonProperty("customer_name")
    private String customerName;
    
    @Column(name = "customer_phone", nullable = false)
    @JsonProperty("customer_phone")
    private String customerPhone;
    
    private String channel;
    
    @Column(nullable = false)
    private Integer subtotal;
    
    @Column(name = "delivery_option")
    @JsonProperty("delivery_option")
    private String deliveryOption;
    
    @Column(name = "delivery_fee")
    @JsonProperty("delivery_fee")
    private Integer deliveryFee;
    
    @Column(name = "delivery_location", length = 500)
    @JsonProperty("delivery_location")
    private String deliveryLocation; // Delivery address/location
    
    @Column(name = "user_id")
    @JsonProperty("user_id")
    private Long userId; // Link to user account (nullable for guest orders)
    
    @Column(name = "status")
    private String status = "PENDING"; // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    
    @Column(name = "tracking_number")
    @JsonProperty("tracking_number")
    private String trackingNumber;
    
    @Column(name = "shipped_at")
    @JsonProperty("shipped_at")
    private LocalDateTime shippedAt;
    
    @Column(name = "delivered_at")
    @JsonProperty("delivered_at")
    private LocalDateTime deliveredAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}

