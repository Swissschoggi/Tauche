package com.tauche.tauche.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.service.DiveLogService;
import com.tauche.tauche.service.FileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dives")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true", allowedHeaders = "*")
public class DiveLogController {

    private final DiveLogService service;
    private final FileService fileService;
    private final DiverRepository diverRepository;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(LocalDate.class, new java.beans.PropertyEditorSupport() {
            @Override
            public void setAsText(String text) throws IllegalArgumentException {
                if (text == null || text.trim().isEmpty()) {
                    setValue(null);
                } else {
                    setValue(LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE));
                }
            }
        });
    }

    @GetMapping
    public ResponseEntity<List<DiveLog>> getAll(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated diver profile missing"));

        List<DiveLog> personalLogs = service.getByDiverId(diver.getId());
        return ResponseEntity.ok(personalLogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiveLog> getById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DiveLog diveLog = service.getById(id);
        if (diveLog == null) {
            return ResponseEntity.notFound().build();
        }

        String userEmail = authentication.getName();
        if (!diveLog.getDiver().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(diveLog);
    }

    @PostMapping
    public ResponseEntity<DiveLog> create(@RequestBody DiveLog diveLog, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated diver profile missing"));

        diveLog.setDiver(diver);
        return ResponseEntity.ok(service.create(diveLog));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiveLog> update(
            @PathVariable Long id,
            @RequestBody DiveLog diveLog,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DiveLog existingDive = service.getById(id);
        if (existingDive == null) {
            return ResponseEntity.notFound().build();
        }

        String userEmail = authentication.getName();
        if (!existingDive.getDiver().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (diveLog.getImagePath() == null || diveLog.getImagePath().trim().isEmpty()) {
            diveLog.setImagePath(existingDive.getImagePath());
        }

        diveLog.setDiver(existingDive.getDiver());

        DiveLog updated = service.update(id, diveLog);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DiveLog existingDive = service.getById(id);
        if (existingDive == null) {
            return ResponseEntity.notFound().build();
        }

        String userEmail = authentication.getName();
        if (!existingDive.getDiver().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiveLog> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication
    ) {
        log.info("Incoming multi-part file transaction intercepted for dive log entity ID: {}", id);
        
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        DiveLog existingDive = service.getById(id);
        if (existingDive == null) {
            return ResponseEntity.notFound().build();
        }
        
        String userEmail = authentication.getName();
        if (!existingDive.getDiver().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (image != null && !image.isEmpty()) {
            try {
                String path = fileService.storeImage(image);
                existingDive.setImagePath(path);
                
                DiveLog updated = service.update(id, existingDive);
                return ResponseEntity.ok(updated);
            } catch (Exception e) {
                log.error("Internal processing error encountered during binary execution mapping: ", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        
        return ResponseEntity.badRequest().build();
    }
}