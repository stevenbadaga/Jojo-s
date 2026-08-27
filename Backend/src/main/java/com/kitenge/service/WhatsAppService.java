package com.kitenge.service;

import com.kitenge.model.Order;
import com.kitenge.model.OrderItem;
import com.kitenge.model.Product;
import com.kitenge.repository.ProductRepository;
import com.kitenge.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WhatsAppService {
    
    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);
    
    @Value("${app.admin.whatsapp:}")
    private String adminWhatsApp;
    
    @Value("${app.whatsapp.callmebot.apikey:}")
    private String callMeBotApiKey;
    
    @Value("${app.whatsapp.greenapi.idinstance:}")
    private String greenApiIdInstance;
    
    @Value("${app.whatsapp.greenapi.apitoken:}")
    private String greenApiToken;
    
    @Value("${app.whatsapp.chatapi.instance:}")
    private String chatApiInstance;
    
    @Value("${app.whatsapp.chatapi.token:}")
    private String chatApiToken;
    
    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ProductRepository productRepository;
    
    /**
     * Generates WhatsApp URL for order notification to admin.
     */
    public String generateOrderWhatsAppUrl(Order order) {
        return generateAdminWhatsAppUrl(order);
    }
    
    /**
     * Generates WhatsApp URL for customer to send order to admin.
     */
    public String generateCustomerWhatsAppUrl(Order order, String customerPhone) {
        try {
            String cleanPhone = normalizePhoneNumber(customerPhone);
            if (cleanPhone == null) {
                return null;
            }
            
            String message = buildCustomerMessage(order);
            return buildWaUrl(cleanPhone, message);
        } catch (Exception e) {
            logger.warn("Failed to generate customer WhatsApp URL", e);
            return null;
        }
    }
    
    /**
     * Sends order notification with images via WhatsApp API.
     * Falls back to URL generation if API is not configured.
     */
    public String sendOrderWithImages(Order order) {
        if (!isConfigured(adminWhatsApp)) {
            logger.warn("Admin WhatsApp number is not configured.");
            return null;
        }
        
        try {
            String cleanPhone = normalizePhoneNumber(adminWhatsApp);
            if (cleanPhone == null) {
                logger.warn("Admin WhatsApp number is invalid.");
                return null;
            }
            
            String message = buildAdminMessage(order);
            List<String> productImages = collectProductImages(order);
            
            if (isConfigured(greenApiIdInstance) && isConfigured(greenApiToken)) {
                try {
                    sendViaGreenAPI(cleanPhone, message, productImages);
                    return generateAdminWhatsAppUrl(order);
                } catch (Exception e) {
                    logger.warn("Green API send failed, falling back to URL.", e);
                }
            }
            
            if (isConfigured(chatApiInstance) && isConfigured(chatApiToken)) {
                try {
                    sendViaChatAPI(cleanPhone, message, productImages);
                    return generateAdminWhatsAppUrl(order);
                } catch (Exception e) {
                    logger.warn("ChatAPI send failed, falling back to URL.", e);
                }
            }
            
            return generateAdminWhatsAppUrl(order);
        } catch (Exception e) {
            logger.warn("Failed to send WhatsApp order message", e);
            return generateAdminWhatsAppUrl(order);
        }
    }
    
    /**
     * Sends message with images via Green API.
     */
    private void sendViaGreenAPI(String phoneNumber, String message, List<String> imageUrls) {
        String textUrl = "https://api.green-api.com/waInstance" + greenApiIdInstance
                + "/sendMessage/" + greenApiToken;
        Map<String, Object> textPayload = new HashMap<>();
        textPayload.put("chatId", phoneNumber + "@c.us");
        textPayload.put("message", message);
        restTemplate.postForObject(textUrl, textPayload, String.class);
        
        for (String imageUrl : imageUrls) {
            try {
                String imageApiUrl = "https://api.green-api.com/waInstance" + greenApiIdInstance
                        + "/sendFileByUrl/" + greenApiToken;
                Map<String, Object> imagePayload = new HashMap<>();
                imagePayload.put("chatId", phoneNumber + "@c.us");
                imagePayload.put("urlFile", imageUrl);
                imagePayload.put("fileName", "product.jpg");
                imagePayload.put("caption", "");
                restTemplate.postForObject(imageApiUrl, imagePayload, String.class);
                Thread.sleep(500);
            } catch (Exception e) {
                logger.warn("Green API image send failed", e);
            }
        }
    }
    
    /**
     * Sends message with images via ChatAPI.
     */
    private void sendViaChatAPI(String phoneNumber, String message, List<String> imageUrls) {
        String textUrl = "https://api.chat-api.com/instance" + chatApiInstance
                + "/sendMessage?token=" + chatApiToken;
        Map<String, Object> textPayload = new HashMap<>();
        textPayload.put("phone", phoneNumber);
        textPayload.put("body", message);
        restTemplate.postForObject(textUrl, textPayload, String.class);
        
        for (String imageUrl : imageUrls) {
            try {
                String imageApiUrl = "https://api.chat-api.com/instance" + chatApiInstance
                        + "/sendFile?token=" + chatApiToken;
                Map<String, Object> imagePayload = new HashMap<>();
                imagePayload.put("phone", phoneNumber);
                imagePayload.put("body", imageUrl);
                imagePayload.put("filename", "product.jpg");
                restTemplate.postForObject(imageApiUrl, imagePayload, String.class);
                Thread.sleep(500);
            } catch (Exception e) {
                logger.warn("ChatAPI image send failed", e);
            }
        }
    }
    
    /**
     * Generates WhatsApp URL for admin notification.
     */
    public String generateAdminWhatsAppUrl(Order order) {
        try {
            if (!isConfigured(adminWhatsApp)) {
                logger.warn("Admin WhatsApp number is not configured.");
                return null;
            }
            
            String cleanPhone = normalizePhoneNumber(adminWhatsApp);
            if (cleanPhone == null) {
                logger.warn("Admin WhatsApp number is invalid.");
                return null;
            }
            
            String message = buildAdminMessage(order);
            return buildWaUrl(cleanPhone, message);
        } catch (Exception e) {
            logger.warn("Failed to generate admin WhatsApp URL", e);
            return null;
        }
    }
    
    /**
     * Sends WhatsApp notification to admin when a new order is placed.
     */
    public void sendOrderNotification(Order order) {
        if (!isConfigured(adminWhatsApp)) {
            logger.warn("Admin WhatsApp number is not configured.");
            return;
        }
        
        try {
            String message = buildAdminMessage(order);
            sendWhatsAppMessage(adminWhatsApp, message);
        } catch (Exception e) {
            logger.warn("WhatsApp notification failed", e);
            logOrderNotification(order);
        }
    }

    /**
     * Sends order status update to customer via WhatsApp (best-effort).
     */
    public void sendCustomerStatusUpdate(Order order, String status) {
        if (order == null || !isConfigured(order.getCustomerPhone())) {
            return;
        }
        try {
            String message = buildCustomerStatusMessage(order, status);
            sendWhatsAppMessage(order.getCustomerPhone(), message);
        } catch (Exception e) {
            logger.warn("Failed to send customer WhatsApp status update", e);
        }
    }
    
    /**
     * Sends WhatsApp message automatically to admin using multiple methods.
     */
    private void sendWhatsAppMessage(String phoneNumber, String message) {
        try {
            String cleanPhone = normalizePhoneNumber(phoneNumber);
            if (cleanPhone == null) {
                logger.warn("WhatsApp phone number is invalid.");
                return;
            }
            
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String whatsappUrl = "https://wa.me/" + cleanPhone + "?text=" + encodedMessage;
            
            boolean messageSent = false;
            
            String apiKey = callMeBotApiKey;
            if (!isConfigured(apiKey)) {
                apiKey = System.getenv("CALLMEBOT_API_KEY");
            }
            
            if (isConfigured(apiKey)) {
                try {
                    String apiUrl = "https://api.callmebot.com/whatsapp.php?phone=" + cleanPhone
                            + "&text=" + encodedMessage
                            + "&apikey=" + apiKey;
                    String response = restTemplate.getForObject(apiUrl, String.class);
                    if (response != null && (response.contains("OK") || response.contains("sent") || response.contains("200"))) {
                        messageSent = true;
                        return;
                    }
                } catch (Exception e) {
                    logger.warn("CallMeBot send failed", e);
                }
            }
            
            String webhookUrl = System.getenv("WHATSAPP_WEBHOOK_URL");
            if (!isConfigured(webhookUrl)) {
                webhookUrl = System.getProperty("app.whatsapp.webhook.url");
            }
            
            if (!messageSent && isConfigured(webhookUrl)) {
                try {
                    Map<String, String> payload = new HashMap<>();
                    payload.put("phone", cleanPhone);
                    payload.put("message", message);
                    restTemplate.postForObject(webhookUrl, payload, String.class);
                    messageSent = true;
                    return;
                } catch (Exception e) {
                    logger.warn("Webhook send failed", e);
                }
            }
            
            if (!messageSent) {
                logger.info("WhatsApp not sent automatically. Share this URL: {}", whatsappUrl);
            }
        } catch (Exception e) {
            logger.warn("WhatsApp send failed", e);
        }
    }
    
    /**
     * Logs order details for manual WhatsApp follow-up.
     */
    public void logOrderNotification(Order order) {
        Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
        String url = generateAdminWhatsAppUrl(order);
        if (url != null) {
            logger.info("Order #{} WhatsApp URL: {}", orderNumber, url);
        } else {
            logger.info("Order #{} WhatsApp URL unavailable.", orderNumber);
        }
    }
    
    private String buildCustomerMessage(Order order) {
        Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
        StringBuilder message = new StringBuilder();
        message.append("ORDER CONFIRMATION #").append(orderNumber).append("\n\n");
        message.append("Thank you for your order.\n\n");
        message.append("Order Details:\n");
        message.append("Order Number: #").append(orderNumber).append("\n");
        message.append("Status: PENDING\n\n");
        message.append("Items:\n");
        for (OrderItem item : order.getItems()) {
            message.append("- Product ID: ").append(item.getProductId())
                    .append(" | Qty: ").append(item.getQuantity())
                    .append(" | Unit: ").append(item.getUnitPrice()).append(" RWF\n");
        }
        
        message.append("\nSubtotal: ").append(order.getSubtotal()).append(" RWF\n");
        if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
            message.append("Delivery Fee: ").append(order.getDeliveryFee()).append(" RWF\n");
        }
        int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
        message.append("Total: ").append(total).append(" RWF\n\n");
        message.append("We will contact you soon to confirm your order.");
        if (isConfigured(adminWhatsApp)) {
            message.append("\nContact: ").append(adminWhatsApp);
        }
        return message.toString();
    }

    private String buildCustomerStatusMessage(Order order, String status) {
        Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
        String normalized = status != null ? status.trim().toUpperCase() : "PENDING";
        int total = (order.getSubtotal() != null ? order.getSubtotal() : 0)
                + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);

        StringBuilder message = new StringBuilder();
        message.append("MarketMet\n");

        if ("PENDING".equals(normalized)) {
            message.append("We have received your order #").append(orderNumber).append(".\n");
        } else {
            message.append("Order update #").append(orderNumber).append(".\n");
        }

        message.append("Status: ").append(normalized).append("\n");
        message.append("Total: ").append(total).append(" RWF\n");

        if (order.getTrackingNumber() != null && !order.getTrackingNumber().trim().isEmpty()) {
            message.append("Tracking: ").append(order.getTrackingNumber().trim()).append("\n");
        }

        message.append("Track: ").append(frontendUrl).append("/track-order");
        return message.toString();
    }
    
    private String buildAdminMessage(Order order) {
        Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
        StringBuilder message = new StringBuilder();
        message.append("NEW ORDER #").append(orderNumber).append("\n");
        message.append("================================\n");
        
        if (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                && !"Guest Customer".equalsIgnoreCase(order.getCustomerName())) {
            message.append("Customer: ").append(order.getCustomerName()).append("\n");
        }
        message.append("Phone: ").append(order.getCustomerPhone()).append("\n");
        message.append("Channel: ").append(order.getChannel() != null ? order.getChannel().toUpperCase() : "STORE").append("\n\n");
        
        message.append("Items:\n");
        int itemNumber = 1;
        for (OrderItem item : order.getItems()) {
            String productName = resolveProductName(item);
            int itemTotal = item.getQuantity() * item.getUnitPrice();
            message.append(itemNumber).append(". ").append(productName).append("\n");
            message.append("   Qty: ").append(item.getQuantity()).append("\n");
            message.append("   Unit: ").append(item.getUnitPrice()).append(" RWF\n");
            message.append("   Subtotal: ").append(itemTotal).append(" RWF\n");
            itemNumber++;
        }
        
        message.append("\nSubtotal: ").append(order.getSubtotal()).append(" RWF\n");
        appendDeliveryInfo(message, order);
        int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
        message.append("Total: ").append(total).append(" RWF\n");
        message.append("================================\n");
        message.append("Please process this order.");
        return message.toString();
    }
    
    private void appendDeliveryInfo(StringBuilder message, Order order) {
        if (order.getDeliveryOption() == null || order.getDeliveryOption().isEmpty()) {
            return;
        }
        
        String deliveryLabel = order.getDeliveryOption();
        if ("pickup".equalsIgnoreCase(deliveryLabel)) {
            deliveryLabel = "Pickup (Free)";
        } else if ("kigali".equalsIgnoreCase(deliveryLabel)) {
            deliveryLabel = "Kigali Delivery";
        } else if ("upcountry".equalsIgnoreCase(deliveryLabel)) {
            deliveryLabel = "Upcountry Delivery";
        }
        
        message.append("Delivery: ").append(deliveryLabel);
        if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
            message.append(" (").append(order.getDeliveryFee()).append(" RWF)");
        } else {
            message.append(" (Free)");
        }
        message.append("\n");
        
        if (!"Pickup (Free)".equalsIgnoreCase(deliveryLabel)
                && order.getDeliveryLocation() != null
                && !order.getDeliveryLocation().trim().isEmpty()) {
            message.append("Location: ").append(order.getDeliveryLocation()).append("\n");
        }
    }
    
    private List<String> collectProductImages(Order order) {
        List<String> productImages = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            try {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isEmpty()) {
                    continue;
                }
                Product product = productOpt.get();
                if (product.getImage() == null || product.getImage().trim().isEmpty()) {
                    continue;
                }
                
                String imagePath = product.getImage().trim();
                String imageUrl;
                if (imagePath.startsWith("http")) {
                    imageUrl = imagePath;
                } else if (imagePath.startsWith("/")) {
                    imageUrl = baseUrl + imagePath;
                } else {
                    imageUrl = baseUrl + "/" + imagePath;
                }
                productImages.add(imageUrl);
            } catch (Exception e) {
                logger.warn("Failed to resolve product image for order item {}", item.getProductId(), e);
            }
        }
        return productImages;
    }
    
    private String resolveProductName(OrderItem item) {
        try {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                return productOpt.get().getName();
            }
        } catch (Exception e) {
            logger.warn("Failed to resolve product name for order item {}", item.getProductId(), e);
        }
        return "Product #" + item.getProductId();
    }
    
    private String buildWaUrl(String phone, String message) {
        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        return "https://wa.me/" + phone + "?text=" + encodedMessage;
    }
    
    private String normalizePhoneNumber(String phoneNumber) {
        return PhoneNumberUtils.normalizePhoneNumber(phoneNumber);
    }
    
    private boolean isConfigured(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
