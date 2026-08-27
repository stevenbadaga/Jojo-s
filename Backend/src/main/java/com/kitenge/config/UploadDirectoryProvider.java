package com.kitenge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class UploadDirectoryProvider {

    private final Path uploadDir;

    public UploadDirectoryProvider(@Value("${file.upload-dir:uploads}") String configuredDir) {
        String resolvedDir = configuredDir;
        if (resolvedDir == null || resolvedDir.isBlank() || "uploads".equals(resolvedDir)) {
            Path renderDisk = Paths.get("/var/data");
            if (Files.isDirectory(renderDisk) && Files.isWritable(renderDisk)) {
                resolvedDir = renderDisk.resolve("uploads").toString();
            }
        }
        if (resolvedDir == null || resolvedDir.isBlank()) {
            resolvedDir = "uploads";
        }
        this.uploadDir = Paths.get(resolvedDir).toAbsolutePath().normalize();
    }

    public Path getUploadDir() {
        return uploadDir;
    }
}
