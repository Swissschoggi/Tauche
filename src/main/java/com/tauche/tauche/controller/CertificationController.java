package com.tauche.tauche.controller;

import com.tauche.tauche.dto.CertificationDTO;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.service.CertificationService;
import com.tauche.tauche.repository.DiverRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/certifications")
public class CertificationController {
    
    @Autowired
    private CertificationService certificationService;
    
    @Autowired
    private DiverRepository diverRepository;
    
    @GetMapping
    public ResponseEntity<List<CertificationDTO>> getCertifications(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(certificationService.getUserCertifications(diver));
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<CertificationDTO>> getActiveCertifications(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(certificationService.getActiveCertifications(diver));
    }
    
    @GetMapping("/expiring")
    public ResponseEntity<List<CertificationDTO>> getExpiringCertifications(
            @RequestParam(defaultValue = "30") int daysUntilExpiry,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(certificationService.getExpiringCertifications(diver, daysUntilExpiry));
    }
    
    @PostMapping
    public ResponseEntity<CertificationDTO> createCertification(
            @Valid @RequestBody CertificationDTO dto,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(certificationService.createCertification(diver, dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CertificationDTO> updateCertification(
            @PathVariable Long id,
            @RequestBody CertificationDTO dto,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(certificationService.updateCertification(id, diver, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        certificationService.deleteCertification(id, diver);
        return ResponseEntity.noContent().build();
    }
}
