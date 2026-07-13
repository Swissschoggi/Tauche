package com.tauche.tauche.controller;

import com.tauche.tauche.dto.DiveTripDTO;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.service.DiveTripService;
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
@RequestMapping("/api/trips")
public class DiveTripController {
    
    @Autowired
    private DiveTripService diveTripService;
    
    @Autowired
    private DiverRepository diverRepository;
    
    @GetMapping
    public ResponseEntity<List<DiveTripDTO>> getTrips(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(diveTripService.getUserTrips(diver));
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<DiveTripDTO>> getUpcomingTrips(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(diveTripService.getUpcomingTrips(diver));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DiveTripDTO> getTrip(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(diveTripService.getTripById(id, diver));
    }
    
    @PostMapping
    public ResponseEntity<DiveTripDTO> createTrip(
            @Valid @RequestBody DiveTripDTO dto,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(diveTripService.createTrip(diver, dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DiveTripDTO> updateTrip(
            @PathVariable Long id,
            @RequestBody DiveTripDTO dto,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        return ResponseEntity.ok(diveTripService.updateTrip(id, diver, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        diveTripService.deleteTrip(id, diver);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{tripId}/dives/{diveId}")
    public ResponseEntity<Void> addDiveToTrip(
            @PathVariable Long tripId,
            @PathVariable Long diveId,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        diveTripService.addDiveToTrip(tripId, diveId, diver);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{tripId}/dives/{diveId}")
    public ResponseEntity<Void> removeDiveFromTrip(
            @PathVariable Long tripId,
            @PathVariable Long diveId,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        
        diveTripService.removeDiveFromTrip(tripId, diveId, diver);
        return ResponseEntity.noContent().build();
    }
}
