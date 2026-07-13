package com.tauche.tauche.controller;

import java.util.List;
import java.util.Map;

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

import com.tauche.tauche.dto.BuddyDTO;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.BuddyRepository;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.service.BuddyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/buddies")
@RequiredArgsConstructor
public class BuddyController {

    private final BuddyService buddyService;
    private final DiverRepository diverRepository;
    private final BuddyRepository buddyRepository;

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Long> body) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        Long targetUserId = body.get("userId");
        if (targetUserId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId required"));
        }
        try {
            BuddyDTO dto = buddyService.sendRequest(diver, targetUserId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/accept/{buddyId}")
    public ResponseEntity<BuddyDTO> acceptRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long buddyId) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        return ResponseEntity.ok(buddyService.acceptRequest(diver, buddyId));
    }

    @DeleteMapping("/{buddyId}")
    public ResponseEntity<Void> removeBuddy(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long buddyId) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        buddyService.removeBuddy(diver, buddyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<BuddyDTO>> listBuddies(
            @AuthenticationPrincipal UserDetails userDetails) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        return ResponseEntity.ok(buddyService.getMyBuddies(diver));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<BuddyDTO>> pendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        return ResponseEntity.ok(buddyService.getPendingRequests(diver));
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<BuddyDTO>> outgoingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        return ResponseEntity.ok(buddyService.getOutgoingRequests(diver));
    }

    @GetMapping("/profile/{buddyUserId}")
    public ResponseEntity<?> buddyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long buddyUserId) {
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        try {
            return ResponseEntity.ok(buddyService.getBuddyProfile(diver, buddyUserId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @AuthenticationPrincipal UserDetails userDetails,
            String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        Diver diver = diverRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        List<Map<String, Object>> results = diverRepository
                .findByEmailContainingIgnoreCase(q.trim()).stream()
                .filter(u -> !u.getId().equals(diver.getId()))
                .filter(u -> !buddyRepository.existsByDiverAndBuddy(diver, u))
                .filter(u -> !buddyRepository.existsByDiverAndBuddy(u, diver))
                .map(u -> Map.<String, Object>of("id", u.getId(), "email", u.getEmail()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(results);
    }
}
