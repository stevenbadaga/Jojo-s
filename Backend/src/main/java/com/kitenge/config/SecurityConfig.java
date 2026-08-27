package com.kitenge.config;

import com.kitenge.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/uploads/**").permitAll() // Allow public access to uploaded images
                .requestMatchers(HttpMethod.POST, "/api/register", "/api/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/forgot-password", "/api/reset-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/verify-email", "/api/resend-verification", "/api/verify-2fa").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll() // Health check (for uptime monitors)
                .requestMatchers(HttpMethod.HEAD, "/api/health").permitAll() // UptimeRobot uses HEAD by default
                .requestMatchers(HttpMethod.GET, "/api/public-products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll() // Contact form (public)
                .requestMatchers(HttpMethod.POST, "/api/orders", "/api/orders/beacon").permitAll() // Customers can place orders
                .requestMatchers(HttpMethod.POST, "/api/orders/track").permitAll() // Guest order tracking
                .requestMatchers("/api/orders/my-orders").authenticated() // Users can get their own orders
                .requestMatchers("/api/orders/*/track").authenticated() // Allow authenticated users to track their own orders
                .requestMatchers("/api/products/**", "/api/upload-image").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                .requestMatchers("/api/orders/**").hasAnyRole("ADMIN", "MANAGER", "STAFF") // Order management
                .requestMatchers("/api/stats/**").hasAnyRole("ADMIN", "MANAGER") // Business stats (admin/manager only)
                .requestMatchers("/api/test/email").hasRole("ADMIN") // Email testing
                .requestMatchers(
                    "/api/users/profile",
                    "/api/users/change-password",
                    "/api/users/profile-image",
                    "/api/users/two-factor",
                    "/api/users/deactivate",
                    "/api/users/me",
                    "/api/users/addresses",
                    "/api/users/addresses/**",
                    "/api/users/preferences",
                    "/api/users/notifications"
                ).authenticated() // User profile settings (authenticated users)
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "MANAGER") // User management (admin/manager only) - must come after specific routes
                .requestMatchers("/api/wishlist/**", "/api/check-auth").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/reviews").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Get allowed origins from environment variable or use defaults
        String allowedOriginsEnv = System.getenv("APP_CORS_ALLOWED_ORIGINS");
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            configuration.setAllowedOrigins(Arrays.asList(allowedOriginsEnv.split(",")));
        } else {
            configuration.setAllowedOrigins(List.of(
                "http://localhost:8082", 
                "http://localhost:4000", 
                "http://localhost:3000"
            ));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

