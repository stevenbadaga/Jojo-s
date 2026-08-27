package com.kitenge.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    
    private String name;
    
    private String address;
    
    private String city;
    
    private String country;
}

