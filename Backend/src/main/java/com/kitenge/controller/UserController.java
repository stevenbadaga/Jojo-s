package com.kitenge.controller;

import com.kitenge.dto.*;
import com.kitenge.model.User;
import com.kitenge.repository.ReviewRepository;
import com.kitenge.repository.UserRepository;
import com.kitenge.repository.WishlistRepository;
import com.kitenge.service.FileStorageService;
import com.kitenge.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileService userProfileService;
    private final FileStorageService fileStorageService;
    private final WishlistRepository wishlistRepository;
    private final ReviewRepository reviewRepository;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setEmail(user.getEmail());
            userDto.setPhone(user.getPhone());
            userDto.setName(user.getName());
            userDto.setAddress(user.getAddress());
            userDto.setCity(user.getCity());
            userDto.setCountry(user.getCountry());
            userDto.setProfileImageUrl(user.getProfileImageUrl());
            userDto.setEmailVerified(user.getEmailVerified());
            userDto.setTwoFactorEnabled(user.getTwoFactorEnabled());
            userDto.setActive(user.getActive());
            userDto.setCreatedAt(user.getCreatedAt());
            userDto.setLastLogin(user.getLastLogin());
            userDto.setRole(user.getRole());
            
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load profile: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                // Check if email is already taken by another user
                if (!user.getEmail().equals(request.getEmail()) && 
                    userRepository.existsByEmail(request.getEmail())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
                }
                user.setEmail(request.getEmail());
            }
            
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getName() != null) user.setName(request.getName());
            if (request.getAddress() != null) user.setAddress(request.getAddress());
            if (request.getCity() != null) user.setCity(request.getCity());
            if (request.getCountry() != null) user.setCountry(request.getCountry());
            
            user = userRepository.save(user);
            
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setEmail(user.getEmail());
            userDto.setPhone(user.getPhone());
            userDto.setName(user.getName());
            userDto.setAddress(user.getAddress());
            userDto.setCity(user.getCity());
            userDto.setCountry(user.getCountry());
            userDto.setProfileImageUrl(user.getProfileImageUrl());
            userDto.setEmailVerified(user.getEmailVerified());
            userDto.setTwoFactorEnabled(user.getTwoFactorEnabled());
            userDto.setActive(user.getActive());
            userDto.setCreatedAt(user.getCreatedAt());
            userDto.setLastLogin(user.getLastLogin());
            userDto.setRole(user.getRole());
            
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid password data"));
            }
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
            
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PutMapping("/two-factor")
    public ResponseEntity<?> updateTwoFactor(@RequestBody Map<String, Boolean> request) {
        try {
            Boolean enabled = request.get("enabled");
            if (enabled == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing 'enabled' flag"));
            }

            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setTwoFactorEnabled(enabled);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("twoFactorEnabled", user.getTwoFactorEnabled()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update two-factor settings: " + e.getMessage()));
        }
    }

    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No image uploaded"));
            }

            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String url = fileStorageService.storeFile(file);
            user.setProfileImageUrl(url);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload profile image: " + e.getMessage()));
        }
    }

    @PostMapping("/deactivate")
    public ResponseEntity<?> deactivateAccount() {
        try {
            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin accounts cannot be deactivated"));
            }

            user.setActive(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Account deactivated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to deactivate account: " + e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount() {
        try {
            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin accounts cannot be deleted"));
            }

            wishlistRepository.deleteByUserId(userId);
            reviewRepository.deleteByUserId(userId);
            userRepository.delete(user);

            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete account: " + e.getMessage()));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserDto> userDtos = users.stream().map(user -> {
                UserDto dto = new UserDto();
                dto.setId(user.getId());
                dto.setEmail(user.getEmail());
                dto.setPhone(user.getPhone());
                dto.setName(user.getName());
                dto.setAddress(user.getAddress());
                dto.setCity(user.getCity());
                dto.setCountry(user.getCountry());
                dto.setProfileImageUrl(user.getProfileImageUrl());
                dto.setEmailVerified(user.getEmailVerified());
                dto.setTwoFactorEnabled(user.getTwoFactorEnabled());
                dto.setActive(user.getActive());
                dto.setCreatedAt(user.getCreatedAt());
                dto.setLastLogin(user.getLastLogin());
                dto.setRole(user.getRole());
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(userDtos);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load users: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long currentUserId = (Long) principal.get("userId");
            
            // Prevent users from deleting themselves
            if (currentUserId.equals(id)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You cannot delete your own account"));
            }
            
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Prevent deletion of admin users (optional safety check)
            if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(principal.get("role"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only admins can delete admin users"));
            }
            
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Address Management Endpoints
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses() {
        try {
            Long userId = getCurrentUserId();
            List<UserAddressDto> addresses = userProfileService.getUserAddresses(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load addresses: " + e.getMessage()));
        }
    }
    
    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody UserAddressDto addressDto) {
        try {
            Long userId = getCurrentUserId();
            UserAddressDto saved = userProfileService.addAddress(userId, addressDto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to add address: " + e.getMessage()));
        }
    }
    
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<?> updateAddress(@PathVariable Long addressId, @RequestBody UserAddressDto addressDto) {
        try {
            Long userId = getCurrentUserId();
            UserAddressDto updated = userProfileService.updateAddress(userId, addressId, addressDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update address: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressId) {
        try {
            Long userId = getCurrentUserId();
            userProfileService.deleteAddress(userId, addressId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete address: " + e.getMessage()));
        }
    }
    
    // Preferences Endpoints
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences() {
        try {
            Long userId = getCurrentUserId();
            UserPreferencesDto prefs = userProfileService.getUserPreferences(userId);
            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load preferences: " + e.getMessage()));
        }
    }
    
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody UserPreferencesDto preferencesDto) {
        try {
            Long userId = getCurrentUserId();
            UserPreferencesDto updated = userProfileService.updateUserPreferences(userId, preferencesDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update preferences: " + e.getMessage()));
        }
    }
    
    // Notifications Endpoints
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        try {
            Long userId = getCurrentUserId();
            UserNotificationsDto notifs = userProfileService.getUserNotifications(userId);
            return ResponseEntity.ok(notifs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load notifications: " + e.getMessage()));
        }
    }
    
    @PutMapping("/notifications")
    public ResponseEntity<?> updateNotifications(@RequestBody UserNotificationsDto notificationsDto) {
        try {
            Long userId = getCurrentUserId();
            UserNotificationsDto updated = userProfileService.updateUserNotifications(userId, notificationsDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update notifications: " + e.getMessage()));
        }
    }
    
    // Helper method to get current user ID
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Not authenticated");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
        Long userId = (Long) principal.get("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in authentication");
        }
        
        return userId;
    }
}
