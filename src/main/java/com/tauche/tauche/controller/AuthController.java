package com.tauche.tauche.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tauche.tauche.config.JwtService;
import com.tauche.tauche.dto.LoginRequest;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiverRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final DiverRepository diverRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Diver diver) {
        if (diverRepository.findByEmail(diver.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        diver.setPassword(passwordEncoder.encode(diver.getPassword()));
        Diver savedDiver = diverRepository.save(diver);
        
        String token = jwtService.generateToken(savedDiver.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest request) { // Use your DTO here
            Diver diver = diverRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (!passwordEncoder.matches(request.getPassword(), diver.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
            }

            String token = jwtService.generateToken(diver.getEmail());
            return ResponseEntity.ok(Map.of("token", token));
        }

        @GetMapping("/profile")
        public ResponseEntity<?> getProfile(Authentication authentication) {
            if (authentication == null) return ResponseEntity.status(401).build();
            String email = authentication.getName();
        Diver diver = diverRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile node not found"));
        
        return ResponseEntity.ok(Map.of("email", diver.getEmail(), "id", diver.getId()));
    }
}