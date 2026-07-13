package com.tauche.tauche.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tauche.tauche.dto.AdminStatsDTO;
import com.tauche.tauche.dto.AdminUserDTO;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiveLogRepository;
import com.tauche.tauche.repository.DiveTripRepository;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.repository.EquipmentRepository;
import com.tauche.tauche.repository.GalleryImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DiverRepository diverRepository;
    private final DiveLogRepository diveLogRepository;
    private final EquipmentRepository equipmentRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final DiveTripRepository diveTripRepository;

    public List<AdminUserDTO> getAllUsers() {
        return diverRepository.findAll().stream()
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());
    }

    public AdminStatsDTO getStats() {
        return AdminStatsDTO.builder()
                .totalUsers(diverRepository.count())
                .totalDives(diveLogRepository.count())
                .totalPhotos(galleryImageRepository.count())
                .totalEquipment(equipmentRepository.count())
                .totalTrips(diveTripRepository.count())
                .build();
    }

    @Transactional
    public AdminUserDTO updateUserRole(Long userId, String newRole) {
        Diver diver = diverRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        diver.setRole(newRole.toUpperCase());
        diverRepository.save(diver);
        return toAdminUserDTO(diver);
    }

    @Transactional
    public AdminUserDTO toggleUserEnabled(Long userId) {
        Diver diver = diverRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        diver.setEnabled(!diver.isEnabled());
        diverRepository.save(diver);
        return toAdminUserDTO(diver);
    }

    @Transactional
    public void deleteUser(Long userId) {
        Diver diver = diverRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        diverRepository.delete(diver);
    }

    private AdminUserDTO toAdminUserDTO(Diver diver) {
        return AdminUserDTO.builder()
                .id(diver.getId())
                .email(diver.getEmail())
                .role(diver.getRole())
                .enabled(diver.isEnabled())
                .diveCount(diveLogRepository.countByDiverId(diver.getId()))
                .buddyCount(0)
                .joinedAt("")
                .build();
    }
}
