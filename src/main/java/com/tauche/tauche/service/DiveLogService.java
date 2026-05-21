package com.tauche.tauche.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.repository.DiveLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiveLogService {

    private final DiveLogRepository repository;

    public List<DiveLog> getAll() {
        return repository.findAll();
    }

    public Optional<DiveLog> findById(Long id) {
        return repository.findById(id);
    }

    public DiveLog getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dive log entry not found: " + id));
    }

    public DiveLog create(DiveLog diveLog) {
        return repository.save(diveLog);
    }

    @Transactional
    public DiveLog update(Long id, DiveLog incomingData) {
        log.info("=== UPDATE SERVICE ===");
        log.info("Updating dive ID: {}", id);
        log.info("Incoming equipment size: {}", 
            incomingData.getEquipmentUsed() != null ? incomingData.getEquipmentUsed().size() : 0);
        
        DiveLog existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target log entry missing: " + id));

        existing.setDiveTitle(incomingData.getDiveTitle());
        existing.setDate(incomingData.getDate());
        existing.setLocation(incomingData.getLocation());
        existing.setDiveSite(incomingData.getDiveSite());
        existing.setDiveType(incomingData.getDiveType());
        existing.setDepthMeters(incomingData.getDepthMeters());
        existing.setDurationMinutes(incomingData.getDurationMinutes());
        existing.setWaterTemperatureCelsius(incomingData.getWaterTemperatureCelsius());
        existing.setVisibilityMeters(incomingData.getVisibilityMeters());
        existing.setWaterType(incomingData.getWaterType());
        existing.setWeather(incomingData.getWeather());
        existing.setSuit(incomingData.getSuit());
        existing.setWeightKg(incomingData.getWeightKg());
        existing.setGas(incomingData.getGas());
        existing.setPressureStartBar(incomingData.getPressureStartBar());
        existing.setPressureEndBar(incomingData.getPressureEndBar());
        existing.setBuddy(incomingData.getBuddy());
        existing.setDiveCenter(incomingData.getDiveCenter());
        existing.setNotes(incomingData.getNotes());
        existing.setLatitude(incomingData.getLatitude());
        existing.setLongitude(incomingData.getLongitude());

        if (incomingData.getImagePath() != null) {
            existing.setImagePath(incomingData.getImagePath());
        }

        existing.setEquipmentUsed(incomingData.getEquipmentUsed());
        log.info("After setting - existing equipment size: {}", existing.getEquipmentUsed().size());

        DiveLog saved = repository.save(existing);
        log.info("After save - saved equipment size: {}", saved.getEquipmentUsed().size());
        
        return saved;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DiveLog> getByDiverId(Long diverId) {
        return repository.findByDiverIdWithEquipment(diverId);
    }
}