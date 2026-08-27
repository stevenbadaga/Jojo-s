package com.kitenge.controller;

import com.kitenge.dto.ContactRequest;
import com.kitenge.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactController {
    
    private final ContactService contactService;
    
    @PostMapping("/contact")
    public ResponseEntity<Map<String, String>> sendContactMessage(@Valid @RequestBody ContactRequest request) {
        try {
            contactService.sendContactMessage(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage()
            );
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Your message has been sent successfully. We will get back to you soon.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

