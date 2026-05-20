package com.tauche.tauche.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tauche.tauche.config.JwtService;
import com.tauche.tauche.dto.LoginRequest;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.service.NonceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final DiverRepository diverRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NonceService nonceService;

    @PostMapping("/nonce")
    public ResponseEntity<?> getNonce(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email required"));
        }
        return ResponseEntity.ok(Map.of("nonce", nonceService.generate(email)));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getNonce() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }
        if (!nonceService.validateAndConsume(request.getEmail(), request.getNonce())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired nonce"));
        }
        if (diverRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        Diver diver = new Diver();
        diver.setEmail(request.getEmail());
        diver.setPassword(passwordEncoder.encode(request.getPassword()));
        Diver saved = diverRepository.save(diver);
        return ResponseEntity.ok(Map.of("token", jwtService.generateToken(saved.getEmail())));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("Attempting login for email: {}", request.getEmail());

        if (!nonceService.validateAndConsume(request.getEmail(), request.getNonce())) {
            log.warn("Login failed: Invalid or expired nonce for {}", request.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired nonce"));
        }

        Diver diver = diverRepository.findByEmail(request.getEmail()).orElse(null);
        if (diver == null) {
            log.warn("Login failed: User not found for {}", request.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        // Compare raw incoming password with hashed DB password
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), diver.getPassword());
        if (!passwordMatches) {
            log.warn("Login failed: Password mismatch for {}", request.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        log.info("Login successful for user: {}", request.getEmail());
        return ResponseEntity.ok(Map.of("token", jwtService.generateToken(diver.getEmail())));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        Diver diver = diverRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return ResponseEntity.ok(Map.of("email", diver.getEmail(), "id", diver.getId()));
    }
}