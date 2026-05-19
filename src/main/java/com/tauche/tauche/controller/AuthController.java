package com.tauche.tauche.controller;

import com.tauche.tauche.config.JwtService;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        Diver diver = diverRepository.findByEmail(credentials.get("email"))
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(credentials.get("password"), diver.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        String token = jwtService.generateToken(diver.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtService.extractEmail(jwt);
        Diver diver = diverRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile node not found"));
        
        return ResponseEntity.ok(Map.of("email", diver.getEmail(), "id", diver.getId()));
    }
}