package com.kitenge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final UploadDirectoryProvider uploadDirectoryProvider;

    public WebConfig(UploadDirectoryProvider uploadDirectoryProvider) {
        this.uploadDirectoryProvider = uploadDirectoryProvider;
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDirectoryProvider.getUploadDir().toString() + "/");
    }
    
}

