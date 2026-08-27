package com.kitenge.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CloudinaryProvider {

    private final Cloudinary cloudinary;
    private final boolean configured;

    public CloudinaryProvider(
            @Value("${cloudinary.url:}") String cloudinaryUrl,
            @Value("${cloudinary.cloud.name:}") String cloudName,
            @Value("${cloudinary.api.key:}") String apiKey,
            @Value("${cloudinary.api.secret:}") String apiSecret
    ) {
        Cloudinary resolvedCloudinary = null;
        boolean isConfigured = false;

        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            // Clean the URL by removing angle brackets if present (common mistake)
            String cleanedUrl = cleanCloudinaryUrl(cloudinaryUrl);
            resolvedCloudinary = new Cloudinary(cleanedUrl);
            isConfigured = true;
        } else if (cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()) {
            // Also clean individual values if they have angle brackets
            String cleanedCloudName = cleanValue(cloudName);
            String cleanedApiKey = cleanValue(apiKey);
            String cleanedApiSecret = cleanValue(apiSecret);
            resolvedCloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cleanedCloudName,
                    "api_key", cleanedApiKey,
                    "api_secret", cleanedApiSecret,
                    "secure", true
            ));
            isConfigured = true;
        }

        if (resolvedCloudinary != null) {
            resolvedCloudinary.config.secure = true;
        }

        this.cloudinary = resolvedCloudinary;
        this.configured = isConfigured;
    }

    /**
     * Cleans a Cloudinary URL by removing angle brackets that might be present
     * around the API key and secret values.
     * Example: cloudinary://<key>:<secret>@cloud -> cloudinary://key:secret@cloud
     */
    private String cleanCloudinaryUrl(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        // Remove angle brackets from the URL
        return url.replaceAll("<([^>]+)>", "$1");
    }

    /**
     * Cleans a single value by removing surrounding angle brackets if present.
     */
    private String cleanValue(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        // Remove angle brackets if they wrap the entire value
        String trimmed = value.trim();
        if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }

    public boolean isConfigured() {
        return configured;
    }

    public Cloudinary getCloudinary() {
        return cloudinary;
    }
}
