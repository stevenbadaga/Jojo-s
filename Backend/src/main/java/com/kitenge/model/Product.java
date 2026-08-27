package com.kitenge.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String category;
    
    @Column(nullable = false)
    private Integer price;
    
    private String image;
    
    @Column(name = "in_stock")
    @JsonProperty("in_stock")
    private Boolean inStock = true;
    
    @Column(name = "is_promo")
    @JsonProperty("is_promo")
    private Boolean isPromo = false;
    
    @Column(name = "original_price")
    @JsonProperty("original_price")
    private Integer originalPrice;
    
    private Integer discount;
    
    @Column(name = "active")
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

