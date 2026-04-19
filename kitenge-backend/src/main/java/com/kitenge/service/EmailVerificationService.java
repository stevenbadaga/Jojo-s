package com.kitenge.service;

import com.kitenge.model.EmailVerificationToken;
import com.kitenge.model.User;
import com.kitenge.repository.EmailVerificationTokenRepository;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Transactional
    public void sendVerificationEmail(User user) {
        // Delete any existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());
        
        // Generate new token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUserId(user.getId());
        verificationToken.setExpiresAt(LocalDateTime.now().plusDays(7)); // Token valid for 7 days
        verificationToken.setVerified(false);
        
        tokenRepository.save(verificationToken);
        
        // Send email
        sendVerificationEmail(user.getEmail(), token);
    }
    
    @Transactional
    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));
        
        if (verificationToken.getVerified()) {
            throw new RuntimeException("Email has already been verified");
        }
        
        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }
        
        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Mark email as verified
        user.setEmailVerified(true);
        userRepository.save(user);
        
        // Mark token as verified
        verificationToken.setVerified(true);
        tokenRepository.save(verificationToken);
        
        return true;
    }
    
    private void sendVerificationEmail(String email, String token) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email is not configured; verification email will not be sent.");
                return;
            }

            emailService.sendText(
                    email,
                    "Verify Your Email - Esoko",
                    "Hello,\n\n" +
                            "Thank you for registering with Esoko!\n\n" +
                            "Please verify your email address by clicking the link below:\n" +
                            frontendUrl + "/verify-email?token=" + token + "\n\n" +
                            "This link will expire in 7 days.\n\n" +
                            "If you didn't create an account, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Esoko Team"
            );
        } catch (Exception e) {
            logger.warn("Failed to send verification email", e);
        }
    }
}

