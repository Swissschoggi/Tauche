package com.tauche.tauche.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import com.tauche.tauche.dto.BuddyDTO;
import com.tauche.tauche.model.Buddy;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.BuddyRepository;
import com.tauche.tauche.repository.DiveLogRepository;
import com.tauche.tauche.repository.DiverRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BuddyService {

    private final BuddyRepository buddyRepository;
    private final DiverRepository diverRepository;
    private final DiveLogRepository diveLogRepository;

    @Transactional
    public BuddyDTO sendRequest(Diver requester, Long targetUserId) {
        Diver target = diverRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requester.getId().equals(target.getId())) {
            throw new RuntimeException("Cannot add yourself as a buddy");
        }

        if (buddyRepository.existsByDiverAndBuddy(requester, target)) {
            throw new RuntimeException("Buddy request already exists");
        }

        Buddy buddy = Buddy.builder()
                .diver(requester)
                .buddy(target)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return toDTO(buddyRepository.save(buddy));
    }

    @Transactional
    public BuddyDTO acceptRequest(Diver currentUser, Long buddyId) {
        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new RuntimeException("Buddy request not found"));

        if (!buddy.getBuddy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to accept this request");
        }

        buddy.setStatus("ACCEPTED");
        return toDTO(buddyRepository.save(buddy));
    }

    @Transactional
    public void removeBuddy(Diver currentUser, Long buddyId) {
        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new RuntimeException("Buddy not found"));

        if (!buddy.getDiver().getId().equals(currentUser.getId())
                && !buddy.getBuddy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to remove this buddy");
        }

        buddyRepository.delete(buddy);
    }

    @Transactional(readOnly = true)
    public List<BuddyDTO> getMyBuddies(Diver currentUser) {
        List<Buddy> sent = buddyRepository.findByDiverAndStatus(currentUser, "ACCEPTED");
        List<Buddy> received = buddyRepository.findByBuddyAndStatus(currentUser, "ACCEPTED");
        sent.addAll(received);
        return sent.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BuddyDTO> getPendingRequests(Diver currentUser) {
        return buddyRepository.findByBuddyAndStatus(currentUser, "PENDING")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BuddyDTO> getOutgoingRequests(Diver currentUser) {
        return buddyRepository.findByDiverAndStatus(currentUser, "PENDING")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBuddyProfile(Diver currentUser, Long buddyUserId) {
        Diver target = diverRepository.findById(buddyUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isBuddy = buddyRepository.existsByDiverAndBuddy(currentUser, target)
                || buddyRepository.existsByDiverAndBuddy(target, currentUser);
        if (!isBuddy) {
            throw new RuntimeException("Not a buddy");
        }

        List<com.tauche.tauche.model.DiveLog> dives = diveLogRepository.findByDiverId(buddyUserId);

        int totalDives = dives.size();
        double maxDepth = dives.stream().mapToDouble(d -> d.getDepthMeters() != null ? d.getDepthMeters() : 0).max().orElse(0);
        double avgDepth = dives.stream().mapToDouble(d -> d.getDepthMeters() != null ? d.getDepthMeters() : 0).average().orElse(0);
        int totalDuration = dives.stream().mapToInt(d -> d.getDurationMinutes() != null ? d.getDurationMinutes() : 0).sum();
        int avgDuration = totalDives > 0 ? totalDuration / totalDives : 0;
        String lastDiveDate = dives.stream()
                .map(d -> d.getDate())
                .filter(d -> d != null)
                .max(java.time.LocalDate::compareTo)
                .map(Object::toString)
                .orElse(null);

        return Map.of(
            "email", target.getEmail(),
            "id", target.getId(),
            "totalDives", totalDives,
            "maxDepth", maxDepth,
            "avgDepth", Math.round(avgDepth * 10.0) / 10.0,
            "totalDuration", totalDuration,
            "avgDuration", avgDuration,
            "lastDiveDate", lastDiveDate != null ? lastDiveDate : ""
        );
    }

    private BuddyDTO toDTO(Buddy buddy) {
        Diver buddyUser = buddy.getDiver().getId().equals(buddy.getBuddy().getId())
                ? buddy.getBuddy() : buddy.getBuddy();
        return BuddyDTO.builder()
                .id(buddy.getId())
                .buddyId(buddy.getBuddy().getId())
                .buddyEmail(buddy.getBuddy().getEmail())
                .status(buddy.getStatus())
                .createdAt(buddy.getCreatedAt() != null ? buddy.getCreatedAt().toString() : "")
                .build();
    }
}
