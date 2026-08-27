package com.kitenge.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "user")
public class UserNotifications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "email_order_updates")
    private Boolean emailOrderUpdates = true;
    
    @Column(name = "email_promotions")
    private Boolean emailPromotions = true;
    
    @Column(name = "email_newsletters")
    private Boolean emailNewsletters = false;
    
    @Column(name = "sms_order_updates")
    private Boolean smsOrderUpdates = false;
    
    @Column(name = "sms_promotions")
    private Boolean smsPromotions = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
