package com.kitenge.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.email.webhook.url:}")
    private String emailWebhookUrl;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isConfigured() {
        return isWebhookConfigured() || isSmtpConfigured();
    }

    public boolean sendText(String to, String subject, String text) {
        return sendText(to, subject, text, null);
    }

    public boolean sendText(String to, String subject, String text, String from) {
        if (!isPresent(to) || !isPresent(subject) || !isPresent(text)) {
            return false;
        }

        String resolvedFrom = resolveFrom(from);

        // Prefer webhook when configured (works on Render free since it's HTTPS).
        if (isWebhookConfigured()) {
            return sendViaWebhook(to.trim(), subject.trim(), text, resolvedFrom);
        }

        if (!isSmtpConfigured()) {
            logger.info("Email not configured. Skipping email to {}.", to);
            return false;
        }

        return sendViaSmtp(to.trim(), subject.trim(), text, resolvedFrom);
    }

    private boolean sendViaWebhook(String to, String subject, String text, String from) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("to", to);
            payload.put("from", from != null ? from : "");
            payload.put("subject", subject);
            payload.put("text", text);
            restTemplate.postForObject(emailWebhookUrl.trim(), payload, String.class);
            return true;
        } catch (Exception e) {
            logger.warn("Email webhook send failed", e);
            return false;
        }
    }

    private boolean sendViaSmtp(String to, String subject, String text, String from) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (isPresent(from)) {
                message.setFrom(from.trim());
            }
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            logger.warn("SMTP email send failed", e);
            return false;
        }
    }

    private boolean isWebhookConfigured() {
        return isPresent(emailWebhookUrl);
    }

    private boolean isSmtpConfigured() {
        return isPresent(mailUsername);
    }

    private String resolveFrom(String from) {
        if (isPresent(from)) {
            return from.trim();
        }
        if (isPresent(mailFrom)) {
            return mailFrom.trim();
        }
        return isPresent(mailUsername) ? mailUsername.trim() : "";
    }

    private boolean isPresent(String value) {
        return value != null && !value.trim().isEmpty();
    }
}

