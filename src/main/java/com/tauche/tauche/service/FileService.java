package com.tauche.tauche.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private final String uploadDir = "uploads/";

    public String storeImage(MultipartFile file) {
        try {
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get(uploadDir + filename);

            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            return "/uploads/" + filename;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}