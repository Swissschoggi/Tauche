package com.tauche.tauche.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tauche.tauche.dto.EquipmentDTO;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.model.Equipment;
import com.tauche.tauche.repository.EquipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    @Transactional(readOnly = true)
    public List<EquipmentDTO> getEquipmentClosetForDiver(Diver diver) {
        List<Equipment> items = equipmentRepository.findByDiverAndIsActiveTrue(diver);
        System.out.println("Found " + items.size() + " equipment items for diver"); // Debug log
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Equipment saveEquipment(Equipment equipment) {
        if (equipment.getIsActive() == null) {
            equipment.setIsActive(true);
        }
        Equipment saved = equipmentRepository.save(equipment);
        System.out.println("Saved equipment with ID: " + saved.getId() + ", isActive: " + saved.getIsActive());
        return saved;
    }

    @Transactional
    public void deleteEquipment(Long id) {
        equipmentRepository.findById(id).ifPresent(item -> {
            item.setIsActive(false); 
            equipmentRepository.save(item);
            System.out.println("Deactivated equipment with ID: " + id); // Debug log
        });
    }

    public EquipmentDTO convertToDTO(Equipment item) {
        System.out.println("Converting equipment to DTO: " + item.getName()); // Debug log
        
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setCategory(item.getCategory());
        dto.setSerialNumber(item.getSerialNumber());
        dto.setPurchaseDate(item.getPurchaseDate());
        dto.setLastServiceDate(item.getLastServiceDate());
        dto.setServiceIntervalDives(item.getServiceIntervalDives());
        dto.setServiceIntervalMonths(item.getServiceIntervalMonths());
        dto.setIsActive(item.getIsActive());
        dto.setNotes(item.getNotes());

        long totalDives = equipmentRepository.countTotalDivesByEquipmentId(item.getId());
        long totalMins = equipmentRepository.sumTotalMinutesByEquipmentId(item.getId());
        long divesSinceService = equipmentRepository.countDivesSinceService(item.getId(), item.getLastServiceDate());

        dto.setTotalDivesWithGear(totalDives);
        dto.setTotalMinutesWithGear(totalMins);
        dto.setDivesSinceLastService(divesSinceService);

        LocalDate nextServiceByDate = item.getLastServiceDate().plusMonths(item.getServiceIntervalMonths());
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextServiceByDate);
        dto.setDaysRemainingUntilService(daysRemaining);

        boolean timeExpired = daysRemaining <= 0;
        boolean countExpired = divesSinceService >= item.getServiceIntervalDives();
        dto.setRequiresService(timeExpired || countExpired);

        return dto;
    }
}