package com.tauche.tauche.service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.model.GalleryImage;
import com.tauche.tauche.repository.DiveLogRepository;
import com.tauche.tauche.repository.GalleryImageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiveLogService {

    private final DiveLogRepository repository;
    private final GalleryImageRepository galleryImageRepository;

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
        if (diveLog.getNotes() != null) {
            diveLog.setNotes(stripHtml(diveLog.getNotes()));
        }
        return repository.save(diveLog);
    }

    @Transactional
    public DiveLog update(Long id, DiveLog incomingData) {
        log.info("=== UPDATE SERVICE ===");
        log.info("Updating dive ID: {}", id);
        
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
        existing.setNotes(incomingData.getNotes() != null ? stripHtml(incomingData.getNotes()) : null);
        existing.setLatitude(incomingData.getLatitude());
        existing.setLongitude(incomingData.getLongitude());
        existing.setShareToken(incomingData.getShareToken());

        if (incomingData.getImagePath() != null) {
            existing.setImagePath(incomingData.getImagePath());
        }

        if (incomingData.getEquipmentUsed() != null) {
            existing.setEquipmentUsed(incomingData.getEquipmentUsed());
            log.info("After setting - existing equipment size: {}", existing.getEquipmentUsed().size());
        }

        DiveLog saved = repository.save(existing);
        log.info("After save - saved equipment size: {}", saved.getEquipmentUsed() != null ? saved.getEquipmentUsed().size() : 0);
        
        return saved;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DiveLog> getByDiverId(Long diverId) {
        return repository.findByDiverIdWithEquipment(diverId);
    }

    private static final Set<String> VALID_SPECIES = Set.of(
        "sea turtle", "green turtle", "hawksbill turtle",
        "reef shark", "whitetip reef shark", "blacktip reef shark", "hammerhead shark",
        "manta ray", "eagle ray", "spotted eagle ray", "stingray",
        "moray eel", "green moray", "spotted moray",
        "clownfish", "angelfish", "parrotfish", "butterflyfish", "lionfish", "pufferfish",
        "octopus", "cuttlefish", "squid", "seahorse", "pipefish",
        "nudibranch", "crab", "lobster", "shrimp", "sea star", "urchin",
        "barracuda", "grouper", "snapper", "trevally", "triggerfish", "wrasse",
        "surgeonfish", "batfish", "frogfish", "scorpionfish", "stonefish", "damselfish",
        "dolphin", "whale shark", "mola mola", "jellyfish", "sea cucumber",
        "anemone", "flounder", "goatfish", "blenny", "goby", "conch"
    );

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSpeciesSightings(Long diverId) {
        List<DiveLog> dives = repository.findByDiverIdWithEquipment(diverId);
        List<Long> diveIds = dives.stream().map(DiveLog::getId).toList();
        if (diveIds.isEmpty()) return List.of();

        List<GalleryImage> images = galleryImageRepository.findByDiveLogIdIn(diveIds);
        Map<String, Long> counts = new LinkedHashMap<>();
        Map<String, List<Long>> speciesDiveIds = new LinkedHashMap<>();
        Map<String, String> sampleImages = new LinkedHashMap<>();
        Map<String, String> lastSeenMap = new LinkedHashMap<>();
        Map<String, List<String>> allImagePaths = new LinkedHashMap<>();

        for (GalleryImage img : images) {
            if (img.getTags() == null || img.getTags().isBlank()) continue;
            String[] tags = img.getTags().split(",");
            for (String tag : tags) {
                String species = tag.trim().toLowerCase();
                if (species.isEmpty() || !VALID_SPECIES.contains(species)) continue;

                counts.merge(species, 1L, Long::sum);
                Long diveId = img.getDiveLog().getId();
                speciesDiveIds.computeIfAbsent(species, k -> new ArrayList<>()).add(diveId);

                allImagePaths.computeIfAbsent(species, k -> new ArrayList<>()).add(img.getImagePath());

                if (!sampleImages.containsKey(species)) {
                    sampleImages.put(species, img.getImagePath());
                }

                LocalDate sightingDate = img.getDiveLog().getDate();
                if (sightingDate != null) {
                    String existing = lastSeenMap.get(species);
                    if (existing == null || sightingDate.isAfter(LocalDate.parse(existing))) {
                        lastSeenMap.put(species, sightingDate.toString());
                    }
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            String species = entry.getKey();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("species", species.substring(0, 1).toUpperCase() + species.substring(1));
            item.put("count", entry.getValue());
            item.put("diveCount", speciesDiveIds.get(species).stream().distinct().count());
            item.put("imagePath", sampleImages.get(species));
            item.put("imagePaths", allImagePaths.get(species));
            item.put("lastSeen", lastSeenMap.get(species));
            result.add(item);
        }
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        return result;
    }
    
    public Optional<DiveLog> findByShareToken(String token) {
        return repository.findByShareToken(token);
    }

    private String stripHtml(String input) {
        if (input == null) return null;
        String safe = input
            .replaceAll("(?i)<script[^>]*>.*?</script>", "")
            .replaceAll("(?i)<iframe[^>]*>.*?</iframe>", "")
            .replaceAll("(?i)<object[^>]*>.*?</object>", "")
            .replaceAll("(?i)<embed[^>]*>.*?</embed>", "")
            .replaceAll("(?i)<style[^>]*>.*?</style>", "")
            .replaceAll("(?i)<link[^>]*>", "")
            .replaceAll("(?i)<meta[^>]*>", "")
            .replaceAll("(?i)<form[^>]*>.*?</form>", "")
            .replaceAll("(?i)<input[^>]*>", "")
            .replaceAll("(?i)<button[^>]*>.*?</button>", "")
            .replaceAll("(?i)<textarea[^>]*>.*?</textarea>", "")
            .replaceAll("(?i)<select[^>]*>.*?</select>", "")
            .replaceAll("(?i)<option[^>]*>.*?</option>", "")
            .replaceAll("(?i)on\\w+\\s*=\\s*\"[^\"]*\"", "")
            .replaceAll("(?i)on\\w+\\s*=\\s*'[^']*'", "")
            .replaceAll("(?i)on\\w+\\s*=\\s*[^\\s>/]+", "")
            .replaceAll("(?i)javascript\\s*:", "")
            .replaceAll("(?i)data\\s*:", "")
            .trim();
        return safe;
    }
}