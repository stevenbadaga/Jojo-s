package com.kitenge.controller;

import com.kitenge.dto.WishlistRequest;
import com.kitenge.service.WishlistService;
import com.kitenge.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WishlistController {
    
    private final WishlistService wishlistService;
    private final JwtUtil jwtUtil;
    
    @GetMapping("/wishlist")
    public ResponseEntity<List<Long>> getWishlist(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }
    
    @PostMapping("/wishlist")
    public ResponseEntity<Map<String, Boolean>> toggleWishlist(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody WishlistRequest request) {
        Long userId = extractUserId(authHeader);
        wishlistService.toggleWishlist(userId, request.getProductId(), request.getAction());
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    private Long extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractUserId(token);
    }
}

