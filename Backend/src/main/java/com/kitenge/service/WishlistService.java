package com.kitenge.service;

import com.kitenge.model.Wishlist;
import com.kitenge.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    
    public List<Long> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void toggleWishlist(Long userId, Long productId, String action) {
        if ("add".equals(action)) {
            if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
                Wishlist wishlist = new Wishlist();
                wishlist.setUserId(userId);
                wishlist.setProductId(productId);
                wishlistRepository.save(wishlist);
            }
        } else if ("remove".equals(action)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        }
    }
}

