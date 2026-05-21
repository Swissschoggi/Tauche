package com.tauche.tauche.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
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
        System.out.println("Found " + items.size() + " equipment items for diver");
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
    public Optional<Equipment> updateEquipment(Long id, Equipment newData, Diver diver) {
        return equipmentRepository.findById(id)
                .map(existing -> {
                    if (!existing.getDiver().getId().equals(diver.getId())) {
                        throw new RuntimeException("Not authorized to edit this equipment");
                    }
                    existing.setName(newData.getName());
                    existing.setCategory(newData.getCategory());
                    existing.setSerialNumber(newData.getSerialNumber());
                    existing.setPurchaseDate(newData.getPurchaseDate());
                    existing.setLastServiceDate(newData.getLastServiceDate());
                    existing.setServiceIntervalDives(newData.getServiceIntervalDives());
                    existing.setServiceIntervalMonths(newData.getServiceIntervalMonths());
                    existing.setNotes(newData.getNotes());
                    existing.setManufacturer(newData.getManufacturer());
                    existing.setModel(newData.getModel());
                    existing.setPurchasePrice(newData.getPurchasePrice());
                    existing.setLastServiceNotes(newData.getLastServiceNotes());
                    return equipmentRepository.save(existing);
                });
    }

    @Transactional
    public void deleteEquipment(Long id) {
        equipmentRepository.findById(id).ifPresent(item -> {
            item.setIsActive(false); 
            equipmentRepository.save(item);
            System.out.println("Deactivated equipment with ID: " + id);
        });
    }

    public EquipmentDTO convertToDTO(Equipment item) {
        System.out.println("Converting equipment to DTO: " + item.getName());
        
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
        dto.setManufacturer(item.getManufacturer());
        dto.setModel(item.getModel());
        dto.setPurchasePrice(item.getPurchasePrice());
        dto.setLastServiceNotes(item.getLastServiceNotes());

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