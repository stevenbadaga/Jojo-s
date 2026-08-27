package com.kitenge.controller;

import com.kitenge.dto.OrderRequest;
import com.kitenge.model.Order;
import com.kitenge.service.OrderService;
import com.kitenge.service.WhatsAppService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;
    private final WhatsAppService whatsAppService;
    private final ObjectMapper objectMapper;
    
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load orders: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/orders/my-orders")
    public ResponseEntity<?> getMyOrders() {
        try {
            // Get userId from authentication
            Long userId = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> principal = (Map<String, Object>) authentication.getPrincipal();
                Object userIdObj = principal.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                }
            }
            
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }
            
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load orders: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            return orderService.getOrderById(id)
                    .map(order -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("order", order);
                        response.put("items", order.getItems());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load order: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request) {
        try {
            // Get userId from authentication if user is logged in
            Long userId = null;
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null &&
                    authentication.isAuthenticated() &&
                    !"anonymousUser".equals(authentication.getName()) &&
                    authentication.getPrincipal() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> principal = (Map<String, Object>) authentication.getPrincipal();
                    Object userIdObj = principal.get("userId");

                    if (userIdObj instanceof Number) {
                        userId = ((Number) userIdObj).longValue();
                    } else if (userIdObj instanceof String) {
                        try {
                            userId = Long.parseLong((String) userIdObj);
                        } catch (NumberFormatException e) {
                            logger.warn("Failed to parse userId from authentication", e);
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Failed to extract userId from authentication", e);
                // Continue with userId = null for guest checkout
            }

            Order order = orderService.createOrder(request, userId);

            // Generate WhatsApp URL for admin (do not auto-send to avoid duplicates)
            String adminWhatsAppUrl = null;
            try {
                adminWhatsAppUrl = whatsAppService.generateOrderWhatsAppUrl(order);
            } catch (Exception e) {
                logger.warn("WhatsApp URL generation failed", e);
            }

            // Generate WhatsApp URL for customer (optional - for customer confirmation)
            String customerWhatsAppUrl = null;
            if (order.getCustomerPhone() != null && !order.getCustomerPhone().trim().isEmpty()) {
                try {
                    customerWhatsAppUrl = whatsAppService.generateCustomerWhatsAppUrl(order, order.getCustomerPhone());
                } catch (Exception e) {
                    logger.warn("Customer WhatsApp URL generation failed", e);
                }
            }

            // Return order with WhatsApp URLs
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            if (adminWhatsAppUrl != null && !adminWhatsAppUrl.isEmpty()) {
                response.put("adminWhatsAppUrl", adminWhatsAppUrl);
            }
            if (customerWhatsAppUrl != null) {
                response.put("customerWhatsAppUrl", customerWhatsAppUrl);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Order failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Lightweight endpoint for "fire-and-forget" order creation from the frontend.
     * Designed for navigator.sendBeacon(), so it accepts text/plain to avoid CORS preflight.
     */
    @PostMapping(value = "/orders/beacon", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<?> createOrderBeacon(@RequestBody String rawBody) {
        try {
            OrderRequest request = objectMapper.readValue(rawBody, OrderRequest.class);
            Order order = orderService.createOrder(request, null);
            return ResponseEntity.accepted().body(Map.of("orderId", order.getId()));
        } catch (Exception e) {
            logger.warn("Beacon order creation failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            Map<String, Boolean> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String trackingNumber = request.get("trackingNumber");
            
            if (status == null || status.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            Order order = orderService.updateOrderStatus(id, status, trackingNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/orders/track")
    public ResponseEntity<?> trackOrderByNumber(@RequestBody Map<String, String> request) {
        try {
            String orderNumberValue = request.get("orderNumber");
            String phone = request.get("phone");

            if (orderNumberValue == null || orderNumberValue.trim().isEmpty() || phone == null || phone.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order number and phone are required"));
            }

            Integer orderNumber;
            try {
                orderNumber = Integer.parseInt(orderNumberValue.trim());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order number"));
            }

            Order order = orderService.getOrderByOrderNumberAndPhone(orderNumber, phone.trim())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Map<String, Object> trackingInfo = new HashMap<>();
            trackingInfo.put("orderId", order.getId());
            trackingInfo.put("orderNumber", order.getOrderNumber());
            trackingInfo.put("status", order.getStatus());
            trackingInfo.put("trackingNumber", order.getTrackingNumber());
            trackingInfo.put("createdAt", order.getCreatedAt());
            trackingInfo.put("shippedAt", order.getShippedAt());
            trackingInfo.put("deliveredAt", order.getDeliveredAt());

            return ResponseEntity.ok(trackingInfo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/orders/{id}/track")
    public ResponseEntity<?> trackOrder(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = null;
            if (auth != null && auth.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
                Object userIdObj = principal.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                }
            }

            boolean isStaff = auth != null && auth.getAuthorities().stream().anyMatch(authority -> {
                String role = authority.getAuthority();
                return "ROLE_ADMIN".equals(role) || "ROLE_MANAGER".equals(role) || "ROLE_STAFF".equals(role);
            });

            if (!isStaff) {
                if (userId == null || order.getUserId() == null || !order.getUserId().equals(userId)) {
                    return ResponseEntity.status(403).body(Map.of("error", "Not authorized to track this order"));
                }
            }
            
            Map<String, Object> trackingInfo = new HashMap<>();
            trackingInfo.put("orderId", order.getId());
            trackingInfo.put("orderNumber", order.getOrderNumber());
            trackingInfo.put("status", order.getStatus());
            trackingInfo.put("trackingNumber", order.getTrackingNumber());
            trackingInfo.put("createdAt", order.getCreatedAt());
            trackingInfo.put("shippedAt", order.getShippedAt());
            trackingInfo.put("deliveredAt", order.getDeliveredAt());
            
            return ResponseEntity.ok(trackingInfo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}


