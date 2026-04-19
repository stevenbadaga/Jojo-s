package com.kitenge.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StartupMessageLogger {

    private static final Logger logger = LoggerFactory.getLogger(StartupMessageLogger.class);

    private final Environment environment;

    public StartupMessageLogger(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupMessage(ApplicationReadyEvent event) {
        if (!(event.getApplicationContext() instanceof WebServerApplicationContext webContext)
                || webContext.getWebServer() == null) {
            return;
        }

        int port = webContext.getWebServer().getPort();
        String[] activeProfiles = environment.getActiveProfiles();
        String profile = activeProfiles.length == 0 ? "default" : String.join(", ", activeProfiles);

        logger.info("");
        logger.info("========================================");
        logger.info("Esoko backend is running");
        logger.info("Base URL : http://localhost:{}", port);
        logger.info("Health   : http://localhost:{}/api/health", port);
        logger.info("Profile  : {}", profile);
        logger.info("========================================");
    }
}
