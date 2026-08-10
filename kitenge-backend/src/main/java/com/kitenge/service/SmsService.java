package com.kitenge.service;

import com.kitenge.util.PhoneNumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${app.sms.webhook.url:}")
    private String smsWebhookUrl;

    @Value("${app.sms.sender:JOJOGroceries}")
    private String smsSender;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOrderStatusUpdate(String phoneNumber, String message) {
        if (!isConfigured(phoneNumber) || !isConfigured(message)) {
            return;
        }

        String cleanPhone = PhoneNumberUtils.normalizePhoneNumber(phoneNumber);
        if (cleanPhone == null) {
            logger.warn("SMS phone number is invalid.");
            return;
        }

        if (!isConfigured(smsWebhookUrl)) {
            logger.info("SMS webhook not configured. Skipping SMS to {}.", cleanPhone);
            return;
        }

        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("to", cleanPhone);
            payload.put("from", smsSender);
            payload.put("message", message);
            restTemplate.postForObject(smsWebhookUrl, payload, String.class);
        } catch (Exception e) {
            logger.warn("SMS send failed", e);
        }
    }

    private boolean isConfigured(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
