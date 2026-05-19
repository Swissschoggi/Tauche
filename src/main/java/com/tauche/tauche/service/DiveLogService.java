package com.tauche.tauche.service;

import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.repository.DiveLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiveLogService {

    private final DiveLogRepository repository;

    public List<DiveLog> getAll() {
        return repository.findAll();
    }

    public DiveLog getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dive log entry not found"));
    }

    public DiveLog create(DiveLog diveLog) {
        return repository.save(diveLog);
    }

    public DiveLog update(Long id, DiveLog incomingData) {
        DiveLog existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target log entry missing"));

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

        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<DiveLog> getByDiverId(Long diverId) {
        return repository.findByDiverId(diverId);
    }
}