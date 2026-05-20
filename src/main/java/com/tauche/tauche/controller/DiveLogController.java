package com.tauche.tauche.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
    @Transactional(readOnly = true)
    public ResponseEntity<List<DiveLog>> getAll(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated diver profile missing"));

        return ResponseEntity.ok(service.getByDiverId(diver.getId()));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<DiveLog> getById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return service.findById(id)
                .map(diveLog -> {
                    // This line previously crashed because the session was closed
                    if (!diveLog.getDiver().getEmail().equals(authentication.getName())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<DiveLog>build();
                    }
                    return ResponseEntity.ok(diveLog);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DiveLog> create(@RequestBody DiveLog diveLog, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated diver profile missing"));

        diveLog.setDiver(diver);
        return ResponseEntity.ok(service.create(diveLog));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<DiveLog> update(
            @PathVariable Long id,
            @RequestBody DiveLog diveLog,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return service.findById(id)
                .map(existingDive -> {
                    // Accessing .getDiver() here is now safe because of @Transactional
                    if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<DiveLog>build();
                    }
                    if (diveLog.getImagePath() == null || diveLog.getImagePath().trim().isEmpty()) {
                        diveLog.setImagePath(existingDive.getImagePath());
                    }
                    diveLog.setDiver(existingDive.getDiver());
                    return ResponseEntity.ok(service.update(id, diveLog));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return service.findById(id)
                .map(existingDive -> {
                    if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    service.delete(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<DiveLog> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication
    ) {
        log.info("Image upload request for dive ID: {}", id);
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return service.findById(id)
                .map(existingDive -> {
                    if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<DiveLog>build();
                    }
                    if (image == null || image.isEmpty()) {
                        return ResponseEntity.badRequest().<DiveLog>build();
                    }
                    try {
                        String path = fileService.storeImage(image);
                        existingDive.setImagePath(path);
                        return ResponseEntity.ok(service.update(id, existingDive));
                    } catch (IllegalArgumentException e) {
                        log.warn("Rejected upload for dive {}: {}", id, e.getMessage());
                        return ResponseEntity.badRequest().<DiveLog>build();
                    } catch (Exception e) {
                        log.error("Image storage failure for dive {}: ", id, e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<DiveLog>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}