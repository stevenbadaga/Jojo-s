package com.kitenge.config;

import com.kitenge.model.Product;
import com.kitenge.model.User;
import com.kitenge.repository.ProductRepository;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductRepository productRepository;
    
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.default-password:}")
    private String adminDefaultPassword;

    @Value("${app.admin.force-password-reset:false}")
    private boolean forceAdminPasswordReset;

    @Value("${app.seed.sample-products:false}")
    private boolean seedSampleProducts;
    
    @Override
    public void run(String... args) {
        // Ensure all admin users exist and are properly configured
        if (adminEmail == null || adminEmail.trim().isEmpty()) {
            return;
        }
        String[] adminEmails = adminEmail.split(",");
        
        for (String email : adminEmails) {
            String trimmedEmail = email.trim();
            if (trimmedEmail.isEmpty()) {
                continue;
            }
            // Use case-insensitive lookup to find admin by email
            User admin = userRepository.findByEmailIgnoreCase(trimmedEmail).orElse(null);
            
            if (admin == null) {
                if (adminDefaultPassword == null || adminDefaultPassword.trim().isEmpty()) {
                    logger.warn("Admin account not created because app.admin.default-password is not set.");
                    continue;
                }
                // Create admin user if it doesn't exist
                User newAdmin = new User();
                newAdmin.setEmail(trimmedEmail.toLowerCase()); // Store email in lowercase for consistency
                newAdmin.setPasswordHash(passwordEncoder.encode(adminDefaultPassword));
                newAdmin.setRole("ADMIN"); // Explicitly set role to ADMIN
                admin = userRepository.save(newAdmin);
                logger.info("Admin account created: {}", trimmedEmail);
            } else {
                // Ensure role is ADMIN for admin email
                admin.setRole("ADMIN"); // Ensure role is always ADMIN for admin email
                // Normalize email to lowercase
                if (!admin.getEmail().equalsIgnoreCase(trimmedEmail)) {
                    admin.setEmail(trimmedEmail.toLowerCase());
                }
                if (forceAdminPasswordReset && adminDefaultPassword != null && !adminDefaultPassword.trim().isEmpty()) {
                    admin.setPasswordHash(passwordEncoder.encode(adminDefaultPassword));
                    logger.info("Admin password reset for: {}", trimmedEmail);
                }
                admin = userRepository.save(admin);
                logger.info("Admin account updated: {} (role: ADMIN)", trimmedEmail);
            }
            
            // Store admin ID for final variable
            final Long adminId = admin.getId();
            
            // Delete any other users with the admin email (case-insensitive check)
            userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && 
                            u.getEmail().equalsIgnoreCase(trimmedEmail) && 
                            !u.getId().equals(adminId))
                .forEach(u -> {
                    userRepository.delete(u);
                    logger.warn("Deleted duplicate user with admin email: {}", u.getId());
                });
        }

        if (seedSampleProducts) {
            seedProductsIfEmpty();
        }
    }

    private void seedProductsIfEmpty() {
        if (productRepository.count() > 0) {
            return;
        }

        Product first = new Product();
        first.setName("Wireless Earbuds Pro");
        first.setDescription("Compact everyday audio with clear sound and long battery life.");
        first.setCategory("Electronics");
        first.setPrice(45000);
        first.setImage("https://placehold.co/400x300/f97316/ffffff?text=Earbuds");
        first.setInStock(true);
        first.setIsPromo(true);
        first.setOriginalPrice(20000);
        first.setDiscount(25);
        first.setActive(true);

        Product second = new Product();
        second.setName("Minimal Desk Lamp");
        second.setDescription("Warm ambient lighting for study spaces, desks, and bedside tables.");
        second.setCategory("Home");
        second.setPrice(28000);
        second.setImage("https://placehold.co/400x300/1d4ed8/ffffff?text=Lamp");
        second.setInStock(true);
        second.setIsPromo(false);
        second.setActive(true);

        productRepository.save(first);
        productRepository.save(second);
        logger.info("Seeded sample products.");
    }
}


