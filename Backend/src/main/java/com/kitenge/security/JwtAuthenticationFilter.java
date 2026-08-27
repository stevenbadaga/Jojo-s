package com.kitenge.security;

import com.kitenge.util.JwtUtil;
import com.kitenge.model.User;
import com.kitenge.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @Value("${app.admin.email}")
    private String adminEmail;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String token = authHeader.substring(7);
            final String email = jwtUtil.extractEmail(token);
            final Long userId = jwtUtil.extractUserId(token);
            final Boolean isAdmin = jwtUtil.extractIsAdmin(token);
            final String role = jwtUtil.extractRole(token);
            
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.validateToken(token, email)) {
                    if (userId == null) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    User user = userRepository.findById(userId).orElse(null);
                    if (user == null || Boolean.FALSE.equals(user.getActive())) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Determine authorities based on role
                    List<SimpleGrantedAuthority> authorities;
                    if (isAdmin != null && isAdmin) {
                        authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    } else if (role != null) {
                        // Map role to Spring Security authority
                        String roleAuthority = "ROLE_" + role.toUpperCase();
                        authorities = Collections.singletonList(new SimpleGrantedAuthority(roleAuthority));
                    } else {
                        authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
                    }
                    
                    // Store email, userId, and role in authentication principal
                    Map<String, Object> principal = new java.util.HashMap<>();
                    principal.put("email", email);
                    principal.put("userId", userId);
                    principal.put("role", role != null ? role : "CUSTOMER");
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            principal, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }
        
        filterChain.doFilter(request, response);
    }
}

