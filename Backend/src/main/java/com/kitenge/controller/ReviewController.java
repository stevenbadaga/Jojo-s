package com.kitenge.controller;

import com.kitenge.dto.ReviewRequest;
import com.kitenge.model.Review;
import com.kitenge.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Map<String, Double>> getProductRating(@PathVariable Long productId) {
        Double averageRating = reviewService.getProductAverageRating(productId);
        Map<String, Double> response = new HashMap<>();
        response.put("averageRating", averageRating);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            Review review = reviewService.createReview(userId, request);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            reviewService.deleteReview(reviewId, userId);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

