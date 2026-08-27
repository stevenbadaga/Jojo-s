package com.kitenge.service;

import com.kitenge.model.Product;
import com.kitenge.repository.ProductRepository;
import com.kitenge.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    @Value("${app.base.url:http://localhost:8080}")
    private String appBaseUrl;
    
    public List<Product> getAllPublicProducts() {
        return productRepository.findByActiveTrueOrActiveIsNullOrderByIdDesc();
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByInStockDescActiveDescIdDesc();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    @Transactional
    public Product createProduct(Product product) {
        if (product.getActive() == null) {
            product.setActive(true);
        }
        if (product.getInStock() == null) {
            product.setInStock(true);
        }
        if (product.getImage() != null && !product.getImage().isBlank()) {
            product.setImage(normalizeImagePath(product.getImage()));
        }
        return productRepository.save(product);
    }
    
    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        if (productDetails.getName() != null) {
            product.setName(productDetails.getName());
        }
        if (productDetails.getDescription() != null) {
            product.setDescription(productDetails.getDescription());
        }
        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }
        if (productDetails.getPrice() != null) {
            product.setPrice(productDetails.getPrice());
        }
        if (productDetails.getImage() != null && !productDetails.getImage().isBlank()) {
            product.setImage(normalizeImagePath(productDetails.getImage()));
        }
        if (productDetails.getInStock() != null) {
            product.setInStock(productDetails.getInStock());
        }
        if (productDetails.getIsPromo() != null) {
            product.setIsPromo(productDetails.getIsPromo());
        }
        if (productDetails.getOriginalPrice() != null) {
            product.setOriginalPrice(productDetails.getOriginalPrice());
        }
        if (productDetails.getDiscount() != null) {
            product.setDiscount(productDetails.getDiscount());
        }
        if (productDetails.getActive() != null) {
            product.setActive(productDetails.getActive());
        }
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        
        // Check if product is used in any orders
        if (orderItemRepository.existsByProductId(id)) {
            throw new RuntimeException("Cannot delete product: This product is referenced in existing orders. Archive it instead.");
        }
        
        productRepository.delete(product);
    }

    private String normalizeImagePath(String imagePath) {
        String trimmed = imagePath.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            return trimmed;
        }
        if (appBaseUrl == null || appBaseUrl.isBlank()) {
            return trimmed;
        }
        String normalizedBase = appBaseUrl.endsWith("/") ? appBaseUrl.substring(0, appBaseUrl.length() - 1) : appBaseUrl;
        if (trimmed.startsWith(normalizedBase + "/")) {
            return trimmed.substring(normalizedBase.length());
        }
        return trimmed;
    }
}

