package com.tauche.tauche.controller;

import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tauche.tauche.dto.EquipmentDTO;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.model.Equipment;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.service.EquipmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final DiverRepository diverRepository;

    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getEquipmentCloset(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("=== GET EQUIPMENT REQUEST ===");
        log.info("User email: {}", userDetails.getUsername());
        
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver profile lookup failed"));
        log.info("Found diver ID: {}", diver.getId());
        
        List<EquipmentDTO> equipment = equipmentService.getEquipmentClosetForDiver(diver);
        log.info("Returning {} equipment items", equipment.size());
        
        return ResponseEntity.ok(equipment);
    }

    @PostMapping
    public ResponseEntity<EquipmentDTO> addEquipmentItem(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody EquipmentDTO dto) {
        log.info("=== ADD EQUIPMENT REQUEST ===");
        log.info("User email: {}", userDetails.getUsername());
        
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver profile lookup failed"));
        
        Equipment saved = equipmentService.createEquipment(diver, dto);
        
        EquipmentDTO result = equipmentService.convertToDTO(saved);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipmentItem(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("=== UPDATE EQUIPMENT REQUEST ===");
        log.info("Equipment ID: {}", id);
        log.info("User email: {}", userDetails.getUsername());
        
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver profile lookup failed"));
        
        Optional<Equipment> updated = equipmentService.updateEquipmentFromDTO(id, dto, diver);
        
        if (updated.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        EquipmentDTO result = equipmentService.convertToDTO(updated.get());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeEquipmentItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver profile lookup failed"));
        equipmentService.deleteEquipment(id, diver);
        return ResponseEntity.noContent().build();
    }
}