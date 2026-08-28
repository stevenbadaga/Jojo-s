package com.kitenge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {
    
    private final EmailService emailService;
    
    @Value("${app.admin.email:marketmate77@gmail.com}")
    private String adminEmail;
    
    @Value("${app.admin.notification.email:marketmate77@gmail.com}")
    private String adminNotificationEmail;
    
    public void sendContactMessage(String name, String email, String subject, String message) {
        try {
            if (!emailService.isConfigured()) {
                throw new RuntimeException("Email is not configured. Set EMAIL_WEBHOOK_URL (recommended on Render free) or SPRING_MAIL_USERNAME/SPRING_MAIL_PASSWORD.");
            }

            // Send email to notification email(s) only
            String[] notificationEmails = adminNotificationEmail.split(",");
            String senderEmail = notificationEmails[0].trim(); // Use first notification email as sender
            for (String notificationEmail : notificationEmails) {
                emailService.sendText(
                        notificationEmail.trim(),
                        "New Contact Form Message: " + subject,
                        "You have received a new message from the contact form:\n\n" +
                                "Name: " + name + "\n" +
                                "Email: " + email + "\n" +
                                "Subject: " + subject + "\n\n" +
                                "Message:\n" + message + "\n\n" +
                                "---\n" +
                                "Reply to: " + email,
                        senderEmail
                );
            }
            
            // Send confirmation email to user
            emailService.sendText(
                    email,
                    "Thank you for contacting MarketMet",
                    "Dear " + name + ",\n\n" +
                            "Thank you for contacting MarketMet (Fresh Groceries to Your Door.). We have received your message and will get back to you as soon as possible.\n\n" +
                            "Your message:\n" +
                            "Subject: " + subject + "\n" +
                            "Message: " + message + "\n\n" +
                            "Best regards,\n" +
                            "MarketMet Team",
                    senderEmail
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to send contact message: " + e.getMessage());
        }
    }
}

