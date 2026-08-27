package com.kitenge.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WishlistRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    @NotNull(message = "Action is required")
    private String action; // "add" or "remove"
}

