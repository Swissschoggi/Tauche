package com.tauche.tauche.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private final Path uploadRoot = Paths.get("uploads/").toAbsolutePath().normalize();

    public String storeImage(MultipartFile file) {
        try {
            String originalName = file.getOriginalFilename();
            String safeName = originalName != null
                    ? Paths.get(originalName).getFileName().toString()
                    : "upload";

            safeName = safeName.replaceAll("[^a-zA-Z0-9._-]", "_");

            String ext = "";
            int dotIdx = safeName.lastIndexOf('.');
            if (dotIdx > 0) {
                ext = safeName.substring(dotIdx).toLowerCase();
            }
            if (!ext.matches("\\.(jpg|jpeg|png|gif|webp)")) {
                throw new IllegalArgumentException("Unsupported image type: " + ext);
            }

            String filename = UUID.randomUUID() + "_" + System.currentTimeMillis() + ext;

            Files.createDirectories(uploadRoot);

            Path targetPath = uploadRoot.resolve(filename).normalize();
            if (!targetPath.startsWith(uploadRoot)) {
                throw new SecurityException("Path traversal attempt detected");
            }

            Files.write(targetPath, file.getBytes());

            return "/uploads/" + filename;

        } catch (IllegalArgumentException | SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}