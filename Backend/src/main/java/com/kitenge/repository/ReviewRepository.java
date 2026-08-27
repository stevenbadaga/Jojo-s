package com.kitenge.repository;

import com.kitenge.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
    Double findAverageRatingByProductId(Long productId);
}

