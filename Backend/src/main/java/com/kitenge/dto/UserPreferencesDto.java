package com.kitenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDto {
    private Long id;
    private String language;
    private String currency;
    private String theme;
    private String dateFormat;
    private String timezone;
}
