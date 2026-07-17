package com.tauche.tauche.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.WebDataBinder;
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

import com.tauche.tauche.dto.DiveLogDTO;
import com.tauche.tauche.dto.GalleryImageDTO;
import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.model.Equipment;
import com.tauche.tauche.model.GalleryImage;
import com.tauche.tauche.repository.DiverRepository;
import com.tauche.tauche.repository.EquipmentRepository;
import com.tauche.tauche.repository.GalleryImageRepository;
import com.tauche.tauche.service.DiveLogService;
import com.tauche.tauche.service.FileService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dives")
@RequiredArgsConstructor
public class DiveLogController {

    private final DiveLogService service;
    private final FileService fileService;
    private final DiverRepository diverRepository;
    private final EquipmentRepository equipmentRepository;
    private final GalleryImageRepository galleryImageRepository;

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
    public ResponseEntity<List<DiveLogDTO>> getAll(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated diver profile missing"));

        List<DiveLog> dives = service.getByDiverId(diver.getId());
        
        List<DiveLogDTO> diveDTOs = dives.stream()
                .map(DiveLogDTO::fromEntity)
                .toList();
        
        return ResponseEntity.ok(diveDTOs);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<DiveLogDTO> getById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog diveLog = diveOpt.get();
        if (!diveLog.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        DiveLogDTO dto = DiveLogDTO.fromEntity(diveLog);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DiveLogDTO> create(@Valid @RequestBody DiveLogDTO diveLogDTO, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated diver profile missing"));

        DiveLog diveLog = diveLogDTO.toEntity();
        diveLog.setDiver(diver);
        
        if (diveLogDTO.getEquipmentIds() != null && !diveLogDTO.getEquipmentIds().isEmpty()) {
            Set<Equipment> equipmentSet = new HashSet<>();
            for (Long eqId : diveLogDTO.getEquipmentIds()) {
                equipmentRepository.findById(eqId).ifPresent(equipmentSet::add);
            }
            diveLog.setEquipmentUsed(equipmentSet);
        }
        
        DiveLog saved = service.create(diveLog);
        
        return ResponseEntity.ok(DiveLogDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<DiveLogDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody DiveLogDTO diveLogDTO,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        log.info("=== UPDATE REQUEST ===");
        log.info("Dive ID: {}", id);
        log.info("Equipment IDs from frontend: {}", diveLogDTO.getEquipmentIds());

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        existingDive.setDiveTitle(diveLogDTO.getDiveTitle());
        existingDive.setDate(diveLogDTO.getDate());
        existingDive.setLocation(diveLogDTO.getLocation());
        existingDive.setLatitude(diveLogDTO.getLatitude());
        existingDive.setLongitude(diveLogDTO.getLongitude());
        existingDive.setDiveType(diveLogDTO.getDiveType());
        existingDive.setDivePurpose(diveLogDTO.getDivePurpose());
        existingDive.setDiveSite(diveLogDTO.getDiveSite());
        existingDive.setDepthMeters(diveLogDTO.getDepthMeters());
        existingDive.setCylinderVolumeLiters(diveLogDTO.getCylinderVolumeLiters());
        existingDive.setDurationMinutes(diveLogDTO.getDurationMinutes());
        existingDive.setWaterTemperatureCelsius(diveLogDTO.getWaterTemperatureCelsius());
        existingDive.setVisibilityMeters(diveLogDTO.getVisibilityMeters());
        existingDive.setWaterType(diveLogDTO.getWaterType());
        existingDive.setWeather(diveLogDTO.getWeather());
        existingDive.setSuit(diveLogDTO.getSuit());
        existingDive.setWeightKg(diveLogDTO.getWeightKg());
        existingDive.setGas(diveLogDTO.getGas());
        existingDive.setPressureStartBar(diveLogDTO.getPressureStartBar());
        existingDive.setPressureEndBar(diveLogDTO.getPressureEndBar());
        existingDive.setBuddy(diveLogDTO.getBuddy());
        existingDive.setDiveCenter(diveLogDTO.getDiveCenter());
        existingDive.setNotes(diveLogDTO.getNotes());
        
        if (diveLogDTO.getImagePath() != null && !diveLogDTO.getImagePath().isEmpty()) {
            existingDive.setImagePath(diveLogDTO.getImagePath());
        }
        
        Set<Equipment> equipmentSet = new LinkedHashSet<>(); 
        if (diveLogDTO.getEquipmentIds() != null && !diveLogDTO.getEquipmentIds().isEmpty()) {
            for (Long eqId : diveLogDTO.getEquipmentIds()) {
                equipmentRepository.findById(eqId).ifPresent(equipmentSet::add);
            }
        }
        existingDive.setEquipmentUsed(equipmentSet);
        log.info("Set equipment with {} items", equipmentSet.size());
        
        DiveLog updated = service.update(id, existingDive);
        
        return ResponseEntity.ok(DiveLogDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<DiveLogDTO> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication
    ) {
        log.info("Image upload request for dive ID: {}", id);
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            String path = fileService.storeImage(image);
            existingDive.setImagePath(path);
            DiveLog updated = service.update(id, existingDive);
            return ResponseEntity.ok(DiveLogDTO.fromEntity(updated));
        } catch (IllegalArgumentException e) {
            log.warn("Rejected upload for dive {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Image storage failure for dive {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/share")
    @Transactional
    public ResponseEntity<?> createShareLink(@PathVariable Long id, Authentication authentication, HttpServletRequest request) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        try {
            String userEmail = authentication.getName();
            log.info("Creating share link for dive {} by user {}", id, userEmail);
            
            Optional<DiveLog> diveOpt = service.findById(id);
            if (diveOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            DiveLog dive = diveOpt.get();
            
            Optional<Diver> diverOpt = diverRepository.findById(dive.getDiver().getId());
            if (diverOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            
            if (!diverOpt.get().getEmail().equals(userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String shareToken = dive.getShareToken();
            if (shareToken == null || shareToken.isEmpty()) {
                shareToken = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                dive.setShareToken(shareToken);
                service.update(id, dive);
                log.info("Created new 16-character share token {} for dive {}", shareToken, id);
            }
            
            String envBaseUrl = System.getenv("BASE_URL");
            String baseUrl;
            if (envBaseUrl != null && !envBaseUrl.trim().isEmpty()) {
                baseUrl = envBaseUrl;
            } else {
                String scheme = request.getScheme();
                String serverName = request.getServerName();
                int serverPort = request.getServerPort();
                
                StringBuilder urlBuilder = new StringBuilder();
                urlBuilder.append(scheme).append("://").append(serverName);
                if ((scheme.equals("http") && serverPort != 80) || (scheme.equals("https") && serverPort != 443)) {
                    urlBuilder.append(":").append(serverPort);
                }
                baseUrl = urlBuilder.toString();
            }
            
            String shareUrl = baseUrl + "/shared/dives/" + shareToken;
            
            return ResponseEntity.ok(Map.of("shareUrl", shareUrl, "token", shareToken));
            
        } catch (Exception e) {
            log.error("Error creating share link: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/share/{token}")
        @Transactional(readOnly = true)
        public ResponseEntity<DiveLogDTO> getSharedDive(@PathVariable String token) {
            log.info("Publicly retrieving shared dive info using token: {}", token);
            
            Optional<DiveLog> diveOpt = service.findByShareToken(token);
            if (diveOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            DiveLog diveLog = diveOpt.get();
            DiveLogDTO dto = DiveLogDTO.fromEntity(diveLog);
            
            dto.setNotes(null); 
            
            return ResponseEntity.ok(dto);
        }

    @PostMapping("/{id}/gallery/upload")
    @Transactional
    public ResponseEntity<?> uploadGalleryImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication
    ) {
        log.info("Gallery image upload request for dive ID: {}", id);
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            String path = fileService.storeImage(image);
            
            GalleryImage galleryImage = new GalleryImage();
            galleryImage.setDiveLog(existingDive);
            galleryImage.setImagePath(path);
            galleryImage.setCreatedAt(LocalDateTime.now());
            galleryImage.setTags("");
            
            galleryImageRepository.save(galleryImage);
            
            return ResponseEntity.ok(Map.of("imagePath", path, "id", galleryImage.getId()));
        } catch (Exception e) {
            log.error("Gallery image storage failure: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/gallery")
    @Transactional(readOnly = true)
    public ResponseEntity<List<GalleryImageDTO>> getGalleryImages(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<GalleryImage> images = galleryImageRepository.findByDiveLogIdOrderByCreatedAtAsc(id);
        List<GalleryImageDTO> dtos = images.stream()
                .map(GalleryImageDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}/gallery/{imageId}")
    @Transactional
    public ResponseEntity<Void> deleteGalleryImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Optional<GalleryImage> imageOpt = galleryImageRepository.findById(imageId);
        if (imageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        GalleryImage image = imageOpt.get();
        if (!image.getDiveLog().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        galleryImageRepository.delete(image);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/gallery/{imageId}/tags")
    @Transactional
    public ResponseEntity<?> updateGalleryImageTags(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<DiveLog> diveOpt = service.findById(id);
        if (diveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiveLog existingDive = diveOpt.get();
        if (!existingDive.getDiver().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Optional<GalleryImage> imageOpt = galleryImageRepository.findById(imageId);
        if (imageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        GalleryImage image = imageOpt.get();
        if (!image.getDiveLog().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        String tags = body.get("tags");
        image.setTags(tags != null ? tags : "");
        galleryImageRepository.save(image);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sightings")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getSightings(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String userEmail = authentication.getName();
        Diver diver = diverRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Diver not found"));
        List<Map<String, Object>> sightings = service.getSpeciesSightings(diver.getId());
        return ResponseEntity.ok(sightings);
    }
}