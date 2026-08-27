package com.kitenge.service;

import com.kitenge.model.User;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TwoFactorService {
    
    private static final Logger logger = LoggerFactory.getLogger(TwoFactorService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int CODE_TTL_MINUTES = 10;

    private static class TwoFactorCode {
        private final String code;
        private final LocalDateTime expiresAt;

        private TwoFactorCode(String code, LocalDateTime expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    // Store 2FA codes temporarily (in production, use Redis or database)
    private final Map<String, TwoFactorCode> twoFactorCodes = new ConcurrentHashMap<>();
    
    public String generateAndSendCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getTwoFactorEnabled() == null || !user.getTwoFactorEnabled()) {
            throw new RuntimeException("Two-factor authentication is not enabled for this account");
        }
        
        // Generate 6-digit code
        String code = String.format("%06d", new SecureRandom().nextInt(1000000));
        
        // Store code (expires in 10 minutes)
        twoFactorCodes.put(email, new TwoFactorCode(code, LocalDateTime.now().plusMinutes(CODE_TTL_MINUTES)));
        
        // Send email
        sendTwoFactorCode(email, code);
        
        return code; // In production, don't return the code
    }
    
    public boolean verifyCode(String email, String code) {
        TwoFactorCode storedCode = twoFactorCodes.get(email);
        if (storedCode == null) {
            return false;
        }
        
        if (storedCode.expiresAt.isBefore(LocalDateTime.now())) {
            twoFactorCodes.remove(email);
            return false;
        }

        boolean isValid = storedCode.code.equals(code);
        if (isValid) {
            // Remove code after successful verification
            twoFactorCodes.remove(email);
        }
        return isValid;
    }
    
    private void sendTwoFactorCode(String email, String code) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email is not configured; 2FA code will not be sent via email.");
                return;
            }

            emailService.sendText(
                    email,
                    "Your Two-Factor Authentication Code - MarketMet",
                    "Hello,\n\n" +
                            "Your two-factor authentication code is:\n\n" +
                            code + "\n\n" +
                            "This code will expire in 10 minutes.\n\n" +
                            "If you didn't request this code, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "MarketMet Team"
            );
        } catch (Exception e) {
            logger.warn("Failed to send 2FA code", e);
        }
    }
}

