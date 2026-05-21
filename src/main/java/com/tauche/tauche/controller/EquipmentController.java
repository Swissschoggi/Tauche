package com.tauche.tauche.controller;

import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<EquipmentDTO> addEquipmentItem(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Equipment item) {
        log.info("=== ADD EQUIPMENT REQUEST ===");
        log.info("User email: {}", userDetails.getUsername());
        log.info("Equipment name: {}", item.getName());
        log.info("Equipment category: {}", item.getCategory());
        
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver profile lookup failed"));
        log.info("Found diver ID: {}, setting on equipment", diver.getId());
        
        item.setDiver(diver);
        log.info("Diver set on equipment: {}", item.getDiver().getId());
        
        Equipment saved = equipmentService.saveEquipment(item);
        log.info("Saved equipment with ID: {}", saved.getId());
        
        EquipmentDTO dto = equipmentService.convertToDTO(saved);
        log.info("Returning DTO with name: {}", dto.getName());
        
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipmentItem(
            @PathVariable Long id, 
            @RequestBody Equipment item,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("=== UPDATE EQUIPMENT REQUEST ===");
        log.info("Equipment ID: {}", id);
        log.info("User email: {}", userDetails.getUsername());
        
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver profile lookup failed"));
        
        Optional<Equipment> updated = equipmentService.updateEquipment(id, item, diver);
        
        if (updated.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        EquipmentDTO dto = equipmentService.convertToDTO(updated.get());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeEquipmentItem(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}