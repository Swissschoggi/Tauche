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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    @Transactional(readOnly = true)
    public List<EquipmentDTO> getEquipmentClosetForDiver(Diver diver) {
        List<Equipment> items = equipmentRepository.findByDiverAndIsActiveTrue(diver);
        log.info("Found {} equipment items for diver {}", items.size(), diver.getId());
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Equipment saveEquipment(Equipment equipment) {
        if (equipment.getIsActive() == null) {
            equipment.setIsActive(true);
        }
        Equipment saved = equipmentRepository.save(equipment);
        log.info("Saved equipment with ID: {}, isActive: {}", saved.getId(), saved.getIsActive());
        return saved;
    }

    @Transactional
    public Equipment createEquipment(Diver diver, EquipmentDTO dto) {
        Equipment item = new Equipment();
        item.setDiver(diver);
        item.setName(dto.getName());
        item.setCategory(dto.getCategory());
        item.setSerialNumber(dto.getSerialNumber());
        item.setManufacturer(dto.getManufacturer());
        item.setModel(dto.getModel());
        item.setPurchaseDate(dto.getPurchaseDate());
        item.setPurchasePrice(dto.getPurchasePrice());
        item.setLastServiceDate(dto.getLastServiceDate());
        item.setLastServiceNotes(dto.getLastServiceNotes());
        item.setServiceIntervalDives(dto.getServiceIntervalDives());
        item.setServiceIntervalMonths(dto.getServiceIntervalMonths());
        item.setNotes(dto.getNotes());
        item.setIsActive(true);
        return equipmentRepository.save(item);
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
    public Optional<Equipment> updateEquipmentFromDTO(Long id, EquipmentDTO dto, Diver diver) {
        return equipmentRepository.findById(id)
                .map(existing -> {
                    if (!existing.getDiver().getId().equals(diver.getId())) {
                        throw new RuntimeException("Not authorized to edit this equipment");
                    }
                    existing.setName(dto.getName());
                    existing.setCategory(dto.getCategory());
                    existing.setSerialNumber(dto.getSerialNumber());
                    existing.setManufacturer(dto.getManufacturer());
                    existing.setModel(dto.getModel());
                    existing.setPurchaseDate(dto.getPurchaseDate());
                    existing.setPurchasePrice(dto.getPurchasePrice());
                    existing.setLastServiceDate(dto.getLastServiceDate());
                    existing.setLastServiceNotes(dto.getLastServiceNotes());
                    existing.setServiceIntervalDives(dto.getServiceIntervalDives());
                    existing.setServiceIntervalMonths(dto.getServiceIntervalMonths());
                    existing.setNotes(dto.getNotes());
                    return equipmentRepository.save(existing);
                });
    }

    @Transactional
    public void deleteEquipment(Long id, Diver diver) {
        equipmentRepository.findById(id).ifPresentOrElse(item -> {
            if (!item.getDiver().getId().equals(diver.getId())) {
                log.warn("Unauthorized delete attempt by diver {} on equipment {}", diver.getId(), id);
                throw new RuntimeException("Not authorized to delete this equipment");
            }
            item.setIsActive(false);
            equipmentRepository.save(item);
            log.info("Deactivated equipment with ID: {}", id);
        }, () -> {
            log.warn("Equipment with ID {} not found", id);
        });
    }

    public EquipmentDTO convertToDTO(Equipment item) {
        log.debug("Converting equipment to DTO: {}", item.getName());
        
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

        dto.setTotalDivesWithGear(totalDives);
        dto.setTotalMinutesWithGear(totalMins);

        if (item.getLastServiceDate() == null) {
            dto.setDivesSinceLastService(totalDives);
            dto.setDaysRemainingUntilService(Long.MAX_VALUE);
            dto.setRequiresService(false);
        } else {
            long divesSinceService = equipmentRepository.countDivesSinceService(item.getId(), item.getLastServiceDate());
            dto.setDivesSinceLastService(divesSinceService);

            LocalDate nextServiceByDate = item.getLastServiceDate().plusMonths(item.getServiceIntervalMonths());
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextServiceByDate);
            dto.setDaysRemainingUntilService(daysRemaining);

            boolean timeExpired = daysRemaining <= 0;
            boolean countExpired = divesSinceService >= item.getServiceIntervalDives();
            dto.setRequiresService(timeExpired || countExpired);
        }

        return dto;
    }
}