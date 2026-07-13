package com.tauche.tauche.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    );

    private static final List<byte[]> VALID_MAGIC_BYTES = Arrays.asList(
        new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF},
        new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47},
        new byte[]{(byte) 0x47, 0x49, 0x46, 0x38},
        new byte[]{0x52, 0x49, 0x46, 0x46}
    );

    private final Path uploadRoot = Paths.get("uploads/").toAbsolutePath().normalize();

    public String storeImage(MultipartFile file) {
        try {
            String mimeType = file.getContentType();
            if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
                throw new IllegalArgumentException("Unsupported file MIME type");
            }

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

            byte[] fileBytes = file.getBytes();
            if (!isValidImageMagicBytes(fileBytes)) {
                throw new IllegalArgumentException("File content does not match expected image type");
            }

            String filename = UUID.randomUUID() + "_" + System.currentTimeMillis() + ext;

            Files.createDirectories(uploadRoot);

            Path targetPath = uploadRoot.resolve(filename).normalize();
            if (!targetPath.startsWith(uploadRoot)) {
                throw new SecurityException("Path traversal attempt detected");
            }

            Files.write(targetPath, fileBytes);

            return "/uploads/" + filename;

        } catch (IllegalArgumentException | SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private boolean isValidImageMagicBytes(byte[] fileBytes) {
        if (fileBytes.length < 3) return false;
        for (byte[] magic : VALID_MAGIC_BYTES) {
            if (bytesMatch(fileBytes, magic)) {
                if (magic.length == 4 && magic[0] == 0x52) {
                    return fileBytes.length >= 12
                        && fileBytes[8] == 0x57
                        && fileBytes[9] == 0x45
                        && fileBytes[10] == 0x42
                        && fileBytes[11] == 0x50;
                }
                return true;
            }
        }
        return false;
    }

    private boolean bytesMatch(byte[] data, byte[] magic) {
        if (data.length < magic.length) return false;
        for (int i = 0; i < magic.length; i++) {
            if (data[i] != magic[i]) return false;
        }
        return true;
    }
}