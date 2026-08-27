package com.kitenge.service;

import com.kitenge.dto.ReviewRequest;
import com.kitenge.model.Product;
import com.kitenge.model.Review;
import com.kitenge.model.User;
import com.kitenge.repository.ProductRepository;
import com.kitenge.repository.ReviewRepository;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }
    
    public Double getProductAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }
    
    @Transactional
    public Review createReview(Long userId, ReviewRequest request) {
        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), userId)) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = new Review();
        review.setProductId(request.getProductId());
        review.setUserId(userId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUserName(user.getName() != null ? user.getName() : user.getEmail());
        review.setUserEmail(user.getEmail());
        
        return reviewRepository.save(review);
    }
    
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Only allow user to delete their own review
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }
}

