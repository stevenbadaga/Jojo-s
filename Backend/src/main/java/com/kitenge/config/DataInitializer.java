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

        Product p1 = new Product();
        p1.setName("Organic Hass Avocados");
        p1.setDescription("Ripe, creamy organic Hass avocados sourced directly from local organic farms.");
        p1.setCategory("Fruits");
        p1.setPrice(3500);
        p1.setImage("https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80");
        p1.setInStock(true);
        p1.setIsPromo(true);
        p1.setOriginalPrice(4500);
        p1.setDiscount(22);
        p1.setActive(true);

        Product p2 = new Product();
        p2.setName("Farm Fresh Strawberries 500g");
        p2.setDescription("Sweet, juicy hand-picked red strawberries packed with natural vitamin C.");
        p2.setCategory("Fruits");
        p2.setPrice(5000);
        p2.setImage("https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80");
        p2.setInStock(true);
        p2.setIsPromo(true);
        p2.setOriginalPrice(6500);
        p2.setDiscount(23);
        p2.setActive(true);

        Product p3 = new Product();
        p3.setName("Crisp Farm Bell Peppers Mix");
        p3.setDescription("Vibrant red, yellow, and green bell peppers full of crunch and freshness.");
        p3.setCategory("Vegetables");
        p3.setPrice(2800);
        p3.setImage("https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80");
        p3.setInStock(true);
        p3.setIsPromo(false);
        p3.setActive(true);

        Product p4 = new Product();
        p4.setName("Fresh Organic Milk 1L");
        p4.setDescription("Pure pasteurized whole milk from grass-fed dairy farms.");
        p4.setCategory("Dairy");
        p4.setPrice(1800);
        p4.setImage("https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80");
        p4.setInStock(true);
        p4.setIsPromo(false);
        p4.setActive(true);

        Product p5 = new Product();
        p5.setName("Artisan Sourdough Loaf");
        p5.setDescription("Freshly baked crusty sourdough bread crafted with traditional fermentation.");
        p5.setCategory("Bakery");
        p5.setPrice(4000);
        p5.setImage("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80");
        p5.setInStock(true);
        p5.setIsPromo(true);
        p5.setOriginalPrice(5000);
        p5.setDiscount(20);
        p5.setActive(true);

        Product p6 = new Product();
        p6.setName("Extra Virgin Olive Oil 500ml");
        p6.setDescription("Cold-pressed premium extra virgin olive oil perfect for salads and gourmet cooking.");
        p6.setCategory("Pantry");
        p6.setPrice(12500);
        p6.setImage("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80");
        p6.setInStock(true);
        p6.setIsPromo(false);
        p6.setActive(true);

        productRepository.save(p1);
        productRepository.save(p2);
        productRepository.save(p3);
        productRepository.save(p4);
        productRepository.save(p5);
        productRepository.save(p6);
        logger.info("Seeded fresh organic grocery sample products.");
    }
}


