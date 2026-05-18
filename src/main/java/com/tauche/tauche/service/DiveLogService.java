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
        updated.setId(existing.getId());
        return repository.save(updated);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}