package com.kitenge.security;

import com.kitenge.model.Product;
import com.kitenge.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void getOrdersRequiresAuth() throws Exception {
        int statusCode = mockMvc.perform(get("/api/orders"))
                .andReturn()
                .getResponse()
                .getStatus();
        assertTrue(statusCode == 401 || statusCode == 403, "Expected 401 or 403 but got " + statusCode);
    }

    @Test
    void getProductIsPublic() throws Exception {
        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(1000);
        product = productRepository.save(product);

        mockMvc.perform(get("/api/products/" + product.getId()))
                .andExpect(status().isOk());
    }
}
