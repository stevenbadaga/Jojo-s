package com.kitenge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private String customerName; // Optional
    
    @NotBlank(message = "Customer phone is required")
    private String customerPhone;
    
    private String channel;
    
    @NotNull(message = "Subtotal is required")
    private Integer subtotal;
    
    @NotEmpty(message = "Items are required")
    private List<OrderItemDto> items;
    
    private String deliveryOption;
    
    private Integer deliveryFee;
    
    private String deliveryLocation; // Delivery address/location
}

