package com.kitenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressDto {
    private Long id;
    private String label;
    private String street;
    private String city;
    private String country;
    private Boolean isDefault;
}
