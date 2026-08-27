package com.kitenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String profileImageUrl;
    private Boolean emailVerified;
    private Boolean twoFactorEnabled;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String role;
}

