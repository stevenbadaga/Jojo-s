package com.kitenge.service;

import com.kitenge.dto.OrderRequest;
import com.kitenge.dto.OrderItemDto;
import com.kitenge.model.Order;
import com.kitenge.model.OrderItem;
import com.kitenge.model.Product;
import com.kitenge.model.User;
import com.kitenge.model.UserNotifications;
import com.kitenge.repository.OrderRepository;
import com.kitenge.repository.ProductRepository;
import com.kitenge.repository.UserNotificationsRepository;
import com.kitenge.repository.UserRepository;
import com.kitenge.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;
    private final SmsService smsService;
    private final UserNotificationsRepository userNotificationsRepository;
    
    @Value("${app.admin.notification.email:jojogroceries@gmail.com}")
    private String adminNotificationEmail;
    
    @Value("${app.admin.whatsapp:250780453704}")
    private String adminWhatsApp;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByOrderNumberAndPhone(Integer orderNumber, String phone) {
        if (orderNumber == null || phone == null || phone.trim().isEmpty()) {
            return Optional.empty();
        }
        Optional<Order> directMatch = orderRepository.findTopByOrderNumberAndCustomerPhoneOrderByCreatedAtDesc(
                orderNumber,
                phone.trim()
        );
        if (directMatch.isPresent()) {
            return directMatch;
        }

        String normalizedInput = PhoneNumberUtils.normalizePhoneNumber(phone);
        if (normalizedInput == null) {
            return Optional.empty();
        }

        return orderRepository.findByOrderNumberOrderByCreatedAtDesc(orderNumber).stream()
                .filter(order -> normalizedInput.equals(PhoneNumberUtils.normalizePhoneNumber(order.getCustomerPhone())))
                .findFirst();
    }
    
    public List<Order> getOrdersByUserId(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Order> getOrdersByCustomer(String email, String phone) {
        if (email != null && !email.trim().isEmpty()) {
            return orderRepository.findByCustomerNameIgnoreCase(email.trim());
        }
        if (phone != null && !phone.trim().isEmpty()) {
            return orderRepository.findByCustomerPhone(phone.trim());
        }
        return List.of(); // Return empty list if no filter provided
    }
    
    /**
     * Generates a monthly order number that resets to 1 at the start of each month
     * @return The next order number for the current month
     */
    private Integer generateMonthlyOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        
        Optional<Integer> lastOrderNumber = orderRepository.findLastOrderNumberForMonth(year, month);
        
        if (lastOrderNumber.isPresent() && lastOrderNumber.get() != null) {
            return lastOrderNumber.get() + 1;
        } else {
            // First order of the month
            return 1;
        }
    }
    
    @Transactional
    public Order createOrder(OrderRequest request, Long userId) {
        Order order = new Order();
        // Handle optional customer name
        if (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty()) {
            order.setCustomerName(request.getCustomerName().trim());
        } else {
            order.setCustomerName("Guest Customer");
        }
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setChannel(request.getChannel() != null ? request.getChannel() : "store");
        order.setSubtotal(request.getSubtotal());
        order.setDeliveryOption(request.getDeliveryOption());
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0);
        order.setDeliveryLocation(request.getDeliveryLocation() != null ? request.getDeliveryLocation().trim() : null);
        order.setUserId(userId); // Link order to user account (null for guest orders)
        
        for (OrderItemDto itemDto : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemDto.getProductId());
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            order.getItems().add(item);
        }
        
        order.setStatus("PENDING");
        
        // Generate monthly order number (resets to 1 each month)
        Integer orderNumber = generateMonthlyOrderNumber();
        order.setOrderNumber(orderNumber);
        
        order = orderRepository.save(order);

        logger.info("Order created: id={}, orderNumber={}", order.getId(), order.getOrderNumber());
        
        // Send notifications
        sendOrderNotification(order);
        sendOrderConfirmationEmail(order);
        sendCustomerStatusUpdates(order, order.getStatus());
        // Send WhatsApp notification to admin
        whatsAppService.sendOrderNotification(order);
        
        return order;
    }
    
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(order);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, String status, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String previousStatus = order.getStatus();
        String previousTracking = order.getTrackingNumber();
        boolean statusChanged = status != null && !status.equalsIgnoreCase(previousStatus);
        boolean trackingUpdated = trackingNumber != null && !trackingNumber.trim().isEmpty()
                && (previousTracking == null || !previousTracking.equals(trackingNumber.trim()));

        String normalizedStatus = status != null ? status.trim().toUpperCase() : null;
        order.setStatus(normalizedStatus);

        if (trackingNumber != null && !trackingNumber.trim().isEmpty()) {
            order.setTrackingNumber(trackingNumber.trim());
        }

        if ("SHIPPED".equals(normalizedStatus) && order.getShippedAt() == null) {
            order.setShippedAt(LocalDateTime.now());
            sendShippingNotification(order);
        } else if ("DELIVERED".equals(normalizedStatus) && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
            sendDeliveryNotification(order);
        }

        Order saved = orderRepository.save(order);
        if (statusChanged || trackingUpdated) {
            sendCustomerStatusUpdates(saved, normalizedStatus);
        }
        if (statusChanged) {
            sendOrderStatusEmail(saved, normalizedStatus);
        }

        return saved;
    }
    
    private void sendOrderNotification(Order order) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email not configured; admin order notification not sent for order {}", order.getId());
                return;
            }

            if (adminNotificationEmail != null && !adminNotificationEmail.trim().isEmpty()) {
                // Build detailed email content once
                StringBuilder emailContent = new StringBuilder();
                Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
                String monthYear = order.getCreatedAt() != null 
                    ? order.getCreatedAt().getMonth().toString().substring(0, 3) + " " + order.getCreatedAt().getYear()
                    : LocalDateTime.now().getMonth().toString().substring(0, 3) + " " + LocalDateTime.now().getYear();
                emailContent.append("NEW ORDER RECEIVED\n\n");
                emailContent.append("Order #").append(orderNumber).append(" (").append(monthYear).append(")\n");
                emailContent.append("Customer Name: ").append(order.getCustomerName() != null ? order.getCustomerName() : "Guest").append("\n");
                emailContent.append("Phone: ").append(order.getCustomerPhone()).append("\n");
                emailContent.append("Channel: ").append(order.getChannel() != null ? order.getChannel() : "Store").append("\n");
                emailContent.append("Order Date: ").append(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "Now").append("\n\n");
                
                emailContent.append("--------------------------------------------------\n");
                emailContent.append("ORDER ITEMS:\n");
                emailContent.append("--------------------------------------------------\n\n");
                
                // Get product details for each item
                for (OrderItem item : order.getItems()) {
                    String productName = "Product ID: " + item.getProductId();
                    try {
                        Optional<Product> productOpt = productRepository.findById(item.getProductId());
                        if (productOpt.isPresent()) {
                            Product product = productOpt.get();
                            productName = product.getName();
                        }
                    } catch (Exception e) {
                        // Use product ID if fetch fails
                    }
                    
                    emailContent.append("- ").append(productName).append("\n");
                    emailContent.append("  Quantity: ").append(item.getQuantity()).append("\n");
                    emailContent.append("  Unit Price: ").append(item.getUnitPrice()).append(" RWF\n");
                    emailContent.append("  Subtotal: ").append(item.getQuantity() * item.getUnitPrice()).append(" RWF\n\n");
                }
                
                emailContent.append("--------------------------------------------------\n");
                emailContent.append("ORDER SUMMARY:\n");
                emailContent.append("--------------------------------------------------\n");
                emailContent.append("Subtotal: ").append(order.getSubtotal()).append(" RWF\n");
                
                if (order.getDeliveryOption() != null && !order.getDeliveryOption().isEmpty()) {
                    emailContent.append("Delivery Option: ").append(order.getDeliveryOption()).append("\n");
                }
                if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
                    emailContent.append("Delivery Fee: ").append(order.getDeliveryFee()).append(" RWF\n");
                }
                if (order.getDeliveryLocation() != null && !order.getDeliveryLocation().trim().isEmpty()) {
                    emailContent.append("Delivery Location: ").append(order.getDeliveryLocation()).append("\n");
                }
                
                int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
                emailContent.append("TOTAL: ").append(total).append(" RWF\n\n");
                
                emailContent.append("--------------------------------------------------\n");
                emailContent.append("Please process this order promptly.\n");
                emailContent.append("WhatsApp: ").append(adminWhatsApp).append("\n");
                
                // Send email to notification email(s) only
                String[] notificationEmails = adminNotificationEmail.split(",");
                String safeCustomerName = order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                        ? order.getCustomerName().trim()
                        : "Guest Customer";
                for (String notificationEmail : notificationEmails) {
                    if (notificationEmail == null || notificationEmail.trim().isEmpty()) {
                        continue;
                    }
                    boolean sent = emailService.sendText(
                            notificationEmail.trim(),
                            "New Order #" + orderNumber + " - " + safeCustomerName,
                            emailContent.toString()
                    );
                    if (sent) {
                        logger.info("Admin notification email sent for order {}", orderNumber);
                    } else {
                        logger.warn("Admin notification email failed for order {}", orderNumber);
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the order
            logger.warn("Failed to send admin notification email", e);
        }
    }
    
    private void sendOrderConfirmationEmail(Order order) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email not configured; order confirmation email not sent for order {}", order.getId());
                return;
            }
            
            String customerEmail = resolveCustomerEmail(order);
            if (customerEmail == null || !customerEmail.contains("@")) {
                return;
            }

            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            String monthYear = order.getCreatedAt() != null
                    ? order.getCreatedAt().getMonth().toString().substring(0, 3) + " " + order.getCreatedAt().getYear()
                    : LocalDateTime.now().getMonth().toString().substring(0, 3) + " " + LocalDateTime.now().getYear();
            String subject = "Order Received - JOJO Groceries #" + orderNumber;

            String customerName = order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                    ? order.getCustomerName().trim()
                    : "Customer";

            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Hello ").append(customerName).append(",\n\n");
            emailBody.append("We have received your order and will confirm it shortly.\n\n");
            emailBody.append("Order #").append(orderNumber).append(" (").append(monthYear).append(")\n");
            emailBody.append("Subtotal: ").append(order.getSubtotal()).append(" RWF\n");
            emailBody.append("Delivery Fee: ").append(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0).append(" RWF\n");
            if (order.getDeliveryLocation() != null && !order.getDeliveryLocation().trim().isEmpty()) {
                emailBody.append("Delivery Location: ").append(order.getDeliveryLocation()).append("\n");
            }
            emailBody.append("Total: ").append((order.getSubtotal() != null ? order.getSubtotal() : 0) +
                            (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0)).append(" RWF\n\n");
            emailBody.append("Track your order: ").append(frontendUrl).append("/track-order\n\n");
            emailBody.append("Best regards,\n");
            emailBody.append("JOJO Groceries Team");
            boolean sent = emailService.sendText(customerEmail, subject, emailBody.toString());
            if (sent) {
                logger.info("Order confirmation email sent for order {}", order.getId());
            } else {
                logger.warn("Order confirmation email failed for order {}", order.getId());
            }
        } catch (Exception e) {
            logger.warn("Failed to send order confirmation email for order {}", order.getId(), e);
        }
    }
    
    private void sendShippingNotification(Order order) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email not configured; shipping notification not sent for order {}", order.getId());
                return;
            }
            
            String customerEmail = resolveCustomerEmail(order);
            if (customerEmail == null || !customerEmail.contains("@")) {
                return;
            }

            String customerName = order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                    ? order.getCustomerName().trim()
                    : "Customer";

            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            String monthYear = order.getCreatedAt() != null
                    ? order.getCreatedAt().getMonth().toString().substring(0, 3) + " " + order.getCreatedAt().getYear()
                    : LocalDateTime.now().getMonth().toString().substring(0, 3) + " " + LocalDateTime.now().getYear();
            String subject = "Order Shipped - JOJO Groceries #" + orderNumber;

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(customerName).append(",\n\n");
            body.append("Good news! Your order #").append(orderNumber).append(" (").append(monthYear).append(") has been shipped.\n\n");
            if (order.getTrackingNumber() != null && !order.getTrackingNumber().trim().isEmpty()) {
                body.append("Tracking Number: ").append(order.getTrackingNumber().trim()).append("\n\n");
            }
            body.append("Track your order: ").append(frontendUrl).append("/track-order\n\n");
            body.append("Best regards,\n");
            body.append("JOJO Groceries Team");
            boolean sent = emailService.sendText(customerEmail, subject, body.toString());
            if (sent) {
                logger.info("Shipping notification sent for order {}", order.getId());
            } else {
                logger.warn("Shipping notification email failed for order {}", order.getId());
            }
        } catch (Exception e) {
            logger.warn("Failed to send shipping notification for order {}", order.getId(), e);
        }
    }
    
    private void sendDeliveryNotification(Order order) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email not configured; delivery notification not sent for order {}", order.getId());
                return;
            }
            
            String customerEmail = resolveCustomerEmail(order);
            if (customerEmail == null || !customerEmail.contains("@")) {
                return;
            }

            String customerName = order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                    ? order.getCustomerName().trim()
                    : "Customer";

            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            String monthYear = order.getCreatedAt() != null
                    ? order.getCreatedAt().getMonth().toString().substring(0, 3) + " " + order.getCreatedAt().getYear()
                    : LocalDateTime.now().getMonth().toString().substring(0, 3) + " " + LocalDateTime.now().getYear();
            String subject = "Order Delivered - JOJO Groceries #" + orderNumber;

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(customerName).append(",\n\n");
            body.append("Your order #").append(orderNumber).append(" (").append(monthYear).append(") has been delivered.\n\n");
            body.append("Thank you for shopping with JOJO Groceries.\n\n");
            body.append("Best regards,\n");
            body.append("JOJO Groceries Team");
            boolean sent = emailService.sendText(customerEmail, subject, body.toString());
            if (sent) {
                logger.info("Delivery notification sent for order {}", order.getId());
            } else {
                logger.warn("Delivery notification email failed for order {}", order.getId());
            }
        } catch (Exception e) {
            logger.warn("Failed to send delivery notification for order {}", order.getId(), e);
        }
    }

    private void sendCustomerStatusUpdates(Order order, String status) {
        if (order == null || order.getCustomerPhone() == null || order.getCustomerPhone().trim().isEmpty()) {
            return;
        }

        boolean shouldSend = true;
        if (order.getUserId() != null) {
            shouldSend = userNotificationsRepository.findByUserId(order.getUserId())
                    .map(UserNotifications::getSmsOrderUpdates)
                    .orElse(false);
        }

        if (!shouldSend) {
            return;
        }

        String message = buildCustomerStatusMessage(order, status);
        whatsAppService.sendCustomerStatusUpdate(order, status);
        smsService.sendOrderStatusUpdate(order.getCustomerPhone(), message);
    }

    private String buildCustomerStatusMessage(Order order, String status) {
        Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
        String normalized = status != null ? status.trim().toUpperCase() : "PENDING";
        int total = (order.getSubtotal() != null ? order.getSubtotal() : 0)
                + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);

        StringBuilder message = new StringBuilder();
        message.append("JOJO Groceries\n");

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

    private void sendOrderStatusEmail(Order order, String status) {
        try {
            if (!emailService.isConfigured()) {
                logger.warn("Email not configured; order status email not sent for order {}", order != null ? order.getId() : null);
                return;
            }

            String customerEmail = resolveCustomerEmail(order);
            if (customerEmail == null || !customerEmail.contains("@")) {
                return;
            }

            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            String monthYear = order.getCreatedAt() != null
                    ? order.getCreatedAt().getMonth().toString().substring(0, 3) + " " + order.getCreatedAt().getYear()
                    : LocalDateTime.now().getMonth().toString().substring(0, 3) + " " + LocalDateTime.now().getYear();

            String normalizedStatus = status != null ? status.trim().toUpperCase() : "PENDING";
            String subjectPrefix;

            if ("CONFIRMED".equals(normalizedStatus)) {
                subjectPrefix = "Order Confirmed";
            } else if ("PROCESSING".equals(normalizedStatus)) {
                subjectPrefix = "Order Processing";
            } else if ("SHIPPED".equals(normalizedStatus)) {
                subjectPrefix = "Order Shipped";
            } else if ("DELIVERED".equals(normalizedStatus)) {
                subjectPrefix = "Order Delivered";
            } else if ("CANCELLED".equals(normalizedStatus)) {
                subjectPrefix = "Order Cancelled";
            } else {
                subjectPrefix = "Order Update";
            }
            String subject = subjectPrefix + " - JOJO Groceries #" + orderNumber;

            String customerName = order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                    ? order.getCustomerName().trim()
                    : "Customer";

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(customerName).append(",\n\n");
            body.append("Order #").append(orderNumber).append(" (").append(monthYear).append(")\n");
            body.append("Status: ").append(normalizedStatus).append("\n\n");

            if ("CONFIRMED".equals(normalizedStatus)) {
                body.append("We have received and confirmed your order. We will start processing it shortly.\n\n");
            } else if ("PROCESSING".equals(normalizedStatus)) {
                body.append("Your order is being processed. We'll notify you when it ships.\n\n");
            } else if ("CANCELLED".equals(normalizedStatus)) {
                body.append("Your order has been cancelled. If you believe this is a mistake, please contact us.\n\n");
            }

            body.append("Track your order: ").append(frontendUrl).append("/track-order\n\n");
            body.append("Best regards,\n");
            body.append("JOJO Groceries Team");
            boolean sent = emailService.sendText(customerEmail.trim(), subject, body.toString());
            if (!sent) {
                logger.warn("Order status email failed for order {} ({})", orderNumber, normalizedStatus);
            }
        } catch (Exception e) {
            logger.warn("Failed to send order status email for order {}", order != null ? order.getId() : null, e);
        }
    }

    private String resolveCustomerEmail(Order order) {
        if (order == null) {
            return null;
        }

        if (order.getUserId() != null) {
            try {
                User user = userRepository.findById(order.getUserId()).orElse(null);
                if (user != null && user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                    return user.getEmail().trim();
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch user email", e);
            }
        }

        if (order.getCustomerName() != null && order.getCustomerName().contains("@")) {
            return order.getCustomerName().trim();
        }

        return null;
    }

}
