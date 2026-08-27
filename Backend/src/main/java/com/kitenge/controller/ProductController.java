package com.kitenge.controller;

import com.kitenge.model.Product;
import com.kitenge.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping("/public-products")
    public ResponseEntity<List<Product>> getPublicProducts() {
        return ResponseEntity.ok(productService.getAllPublicProducts());
    }
    
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product created = productService.createProduct(product);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updated = productService.updateProduct(id, product);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PatchMapping("/products/{id}/active")
    public ResponseEntity<?> toggleProductActive(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        try {
            Boolean active = request.get("active");
            if (active == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Active status is required");
                return ResponseEntity.badRequest().body(error);
            }
            // Create a new Product object with only the active field set
            Product updateData = new Product();
            updateData.setActive(active);
            Product updated = productService.updateProduct(id, updateData);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            Map<String, Boolean> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Product not found";
            error.put("error", errorMessage);
            if (errorMessage.contains("cannot be deleted") || errorMessage.contains("referenced")) {
                return ResponseEntity.badRequest().body(error);
            }
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Failed to delete product");
            return ResponseEntity.badRequest().body(error);
        }
    }
}

