package com.kitenge.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import com.kitenge.service.EmailService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {
    
    private final EmailService emailService;
    
    @Value("${app.admin.email}")
    private String adminEmail;

    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("email");
        if (toEmail == null || toEmail.isEmpty()) {
            toEmail = adminEmail;
        }
        
        if (!emailService.isConfigured()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email is not configured. Set EMAIL_WEBHOOK_URL (recommended on Render free) or SPRING_MAIL_USERNAME/SPRING_MAIL_PASSWORD.");
            return ResponseEntity.badRequest().body(error);
        }

        boolean sent = emailService.sendText(
                toEmail,
                "Test Email - JOJO Groceries",
                "Hello,\n\n" +
                        "This is a test email from JOJO Groceries.\n\n" +
                        "If you received this email, your email configuration is working correctly!\n\n" +
                        "Best regards,\n" +
                        "JOJO Groceries Team"
        );

        if (!sent) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send test email. If you're on Render free, use EMAIL_WEBHOOK_URL (SMTP ports are blocked).");
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Test email sent successfully to: " + toEmail);
        return ResponseEntity.ok(response);
    }
}

