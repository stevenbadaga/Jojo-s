package com.kitenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserNotificationsDto {
    private Long id;
    private Boolean emailOrderUpdates;
    private Boolean emailPromotions;
    private Boolean emailNewsletters;
    private Boolean smsOrderUpdates;
    private Boolean smsPromotions;
}
