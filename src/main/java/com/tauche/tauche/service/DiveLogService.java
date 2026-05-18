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
                .orElseThrow(() -> new RuntimeException("Dive not found"));
    }

    public DiveLog create(DiveLog diveLog) {
        return repository.save(diveLog);
    }

    public DiveLog update(Long id, DiveLog updated) {
        DiveLog existing = getById(id);

        existing.setDiveTitle(updated.getDiveTitle());
        existing.setDate(updated.getDate());
        existing.setLocation(updated.getLocation());
        existing.setDiveSite(updated.getDiveSite());
        existing.setDiveType(updated.getDiveType());

        existing.setDepthMeters(updated.getDepthMeters());
        existing.setDurationMinutes(updated.getDurationMinutes());
        existing.setWaterTemperatureCelsius(updated.getWaterTemperatureCelsius());
        existing.setVisibilityMeters(updated.getVisibilityMeters());

        existing.setWaterType(updated.getWaterType());
        existing.setWeather(updated.getWeather());

        existing.setSuit(updated.getSuit());
        existing.setWeightKg(updated.getWeightKg());
        existing.setGas(updated.getGas());

        existing.setPressureStartBar(updated.getPressureStartBar());
        existing.setPressureEndBar(updated.getPressureEndBar());

        existing.setBuddy(updated.getBuddy());
        existing.setDiveCenter(updated.getDiveCenter());
        existing.setNotes(updated.getNotes());

        if (updated.getImagePath() != null) {
            existing.setImagePath(updated.getImagePath());
        }

        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}