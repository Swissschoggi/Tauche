package com.tauche.tauche.controller;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

import com.tauche.tauche.config.JwtService;
import com.tauche.tauche.dto.LoginRequest;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.service.NonceService;
import com.tauche.tauche.service.TokenBlacklistService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final DiverRepository diverRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NonceService nonceService;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${RESET_ADMIN_PASSWORD:}")
    private String resetAdminPassword;

    @PostConstruct
    public void checkAdminPasswordReset() {
        if (resetAdminPassword != null && !resetAdminPassword.isBlank()) {
            diverRepository.findByEmail("fynn.gaechter@gmail.com").ifPresent(diver -> {
                diver.setPassword(passwordEncoder.encode(resetAdminPassword));
                diverRepository.save(diver);
                log.info("Password reset for fynn.gaechter@gmail.com via RESET_ADMIN_PASSWORD env var");
            });
        }
    }

    @PostMapping("/nonce")
    public ResponseEntity<?> getNonce(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("nonce", "deprecated"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }
        if (request.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters"));
        }
        if (!request.getPassword().matches(".*[A-Z].*") || !request.getPassword().matches(".*[a-z].*") || !request.getPassword().matches(".*\\d.*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must contain uppercase, lowercase, and a digit"));
        }
        if (diverRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed"));
        }
        Diver diver = new Diver();
        diver.setEmail(request.getEmail());
        diver.setPassword(passwordEncoder.encode(request.getPassword()));
        boolean isFirstUser = diverRepository.count() == 0;
        diver.setRole(isFirstUser ? "ADMIN" : "USER");
        diver.setEnabled(true);
        Diver saved = diverRepository.save(diver);
        return ResponseEntity.ok(Map.of("token", jwtService.generateToken(saved.getEmail())));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("Attempting login for email: {}", request.getEmail());

        Diver diver = diverRepository.findByEmail(request.getEmail()).orElse(null);
        if (diver == null) {
            log.warn("Login failed: User not found for {}", request.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        if (passwordEncoder.matches(request.getPassword(), diver.getPassword())) {
            log.info("Login successful for user: {}", request.getEmail());
            return ResponseEntity.ok(Map.of("token", jwtService.generateToken(diver.getEmail())));
        }

        log.warn("Login failed: Password mismatch for {}", request.getEmail());
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(org.springframework.web.context.request.WebRequest webRequest) {
        String authHeader = webRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklist(token);
            log.info("Token blacklisted for logout");
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        Diver diver = diverRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        String role = diver.getRole() != null ? diver.getRole() : "USER";
        return ResponseEntity.ok(Map.of(
            "email", diver.getEmail(),
            "id", diver.getId(),
            "role", role
        ));
    }
}