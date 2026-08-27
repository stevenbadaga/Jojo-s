package com.kitenge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorRequest {
    @NotBlank(message = "Code is required")
    private String code;
    
    private String email;
}

