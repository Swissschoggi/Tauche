package com.tauche.tauche.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.service.DiveLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dives")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DiveLogController {

    private final DiveLogService service;

    @GetMapping
    public List<DiveLog> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiveLog> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<DiveLog> create(@RequestBody DiveLog diveLog) {
        return ResponseEntity.ok(service.create(diveLog));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiveLog> update(@PathVariable Long id, @RequestBody DiveLog diveLog) {
        return ResponseEntity.ok(service.update(id, diveLog));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}