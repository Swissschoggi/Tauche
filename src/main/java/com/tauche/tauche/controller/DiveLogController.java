package com.tauche.tauche.controller;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.service.DiveLogService;
import com.tauche.tauche.service.FileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dives")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DiveLogController {

    private final DiveLogService service;
    private final FileService fileService;

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

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiveLog> update(
            @PathVariable Long id,
            @ModelAttribute DiveLog diveLog,
            @RequestParam(required = false) MultipartFile image
    ) {
        // 1. update normal fields
        DiveLog updated = service.update(id, diveLog);

        // 2. handle image
        if (image != null && !image.isEmpty()) {
            String path = fileService.storeImage(image);
            updated.setImagePath(path);
        }

        // 3. save final result
        return ResponseEntity.ok(service.update(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}