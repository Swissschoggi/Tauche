package com.tauche.tauche.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dive-shops")
public class DiveShopController {

    private static final String OVERPASS_URL = "https://overpass-api.de/api/interpreter";
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyDiveShops(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "5000") int radius) {

        if (radius < 100 || radius > 50000) {
            return ResponseEntity.badRequest().body(Map.of("message", "Radius must be between 100 and 50000 meters"));
        }

        try {
            double searchLat = lat != null ? lat : 0;
            double searchLng = lng != null ? lng : 0;

            if (location != null && !location.isBlank() && (lat == null || lng == null)) {
                double[] coords = geocode(location);
                if (coords == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Could not find the specified location"));
                }
                searchLat = coords[0];
                searchLng = coords[1];
            }

            if (searchLat == 0 && searchLng == 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Provide lat/lng or a location name"));
            }

            String query = "[out:json];("
                + "node[\"shop\"=\"scuba_diving\"](around:" + radius + "," + searchLat + "," + searchLng + ");"
                + "node[\"amenity\"=\"dive_centre\"](around:" + radius + "," + searchLat + "," + searchLng + ");"
                + ");out body;";

            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            URI uri = new URI(OVERPASS_URL + "?data=" + encodedQuery);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .header("User-Agent", "TaucheDiveLogbook/1.0")
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Overpass API returned status {}: {}", response.statusCode(), response.body());
                return ResponseEntity.status(502).body(Map.of("message", "Failed to fetch dive shops"));
            }

            List<Map<String, Object>> shops = parseShops(response.body());
            return ResponseEntity.ok(Map.of("shops", shops, "searchedAt", Map.of("lat", searchLat, "lng", searchLng)));

        } catch (Exception e) {
            log.error("Error fetching dive shops", e);
            return ResponseEntity.status(502).body(Map.of("message", "Failed to fetch dive shops"));
        }
    }

    @GetMapping("/suggest")
    public ResponseEntity<?> suggestLocations(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(Map.of("suggestions", List.of()));
        }
        try {
            String encoded = URLEncoder.encode(q.trim(), StandardCharsets.UTF_8);
            URI uri = new URI("https://nominatim.openstreetmap.org/search?q=" + encoded
                + "&format=json&limit=5&featureType=city,country,region");
            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .header("User-Agent", "TaucheDiveLogbook/1.0")
                .GET()
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return ResponseEntity.ok(Map.of("suggestions", List.of()));
            }
            var mapper = new ObjectMapper();
            var results = mapper.readTree(response.body());
            List<Map<String, Object>> suggestions = new ArrayList<>();
            for (var r : results) {
                String displayName = r.has("display_name") ? r.get("display_name").asText() : "";
                suggestions.add(Map.of(
                    "label", displayName.length() > 60 ? displayName.substring(0, 60) + "..." : displayName,
                    "lat", r.get("lat").asDouble(),
                    "lng", r.get("lon").asDouble()
                ));
            }
            return ResponseEntity.ok(Map.of("suggestions", suggestions));
        } catch (Exception e) {
            log.error("Geocode suggestion failed", e);
            return ResponseEntity.ok(Map.of("suggestions", List.of()));
        }
    }

    private double[] geocode(String location) throws Exception {
        String encoded = URLEncoder.encode(location, StandardCharsets.UTF_8);
        URI uri = new URI("https://nominatim.openstreetmap.org/search?q=" + encoded + "&format=json&limit=1");
        HttpRequest request = HttpRequest.newBuilder()
            .uri(uri)
            .header("User-Agent", "TaucheDiveLogbook/1.0")
            .GET()
            .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) return null;

        var mapper = new ObjectMapper();
        var results = mapper.readTree(response.body());
        if (results.isEmpty()) return null;

        double lat = results.get(0).get("lat").asDouble();
        double lon = results.get(0).get("lon").asDouble();
        return new double[]{lat, lon};
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseShops(String json) {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            var mapper = new ObjectMapper();
            var root = mapper.readTree(json);
            var elements = root.get("elements");
            if (elements == null) return result;

            for (var el : elements) {
                var tags = el.get("tags");
                if (tags == null) continue;

                double shopLat = el.get("lat").asDouble();
                double shopLng = el.get("lon").asDouble();

                String name = tags.has("name") ? tags.get("name").asText() : "Unnamed Dive Shop";
                String phone = tags.has("phone") ? tags.get("phone").asText() : null;
                String website = tags.has("website") ? tags.get("website").asText() : null;
                String addr = buildAddress(tags);
                String openingHours = tags.has("opening_hours") ? tags.get("opening_hours").asText() : null;
                boolean hasNitrox = tags.has("scuba_diving:nitrox_filling") && "yes".equals(tags.get("scuba_diving:nitrox_filling").asText());
                boolean hasOxygen = tags.has("scuba_diving:oxygen_filling") && "yes".equals(tags.get("scuba_diving:oxygen_filling").asText());
                boolean hasRental = tags.has("scuba_diving:rental") && "yes".equals(tags.get("scuba_diving:rental").asText());
                boolean hasCourses = tags.has("scuba_diving:courses") && "yes".equals(tags.get("scuba_diving:courses").asText());

                result.add(Map.ofEntries(
                    Map.entry("name", name),
                    Map.entry("lat", shopLat),
                    Map.entry("lng", shopLng),
                    Map.entry("phone", phone != null ? phone : ""),
                    Map.entry("website", website != null ? website : ""),
                    Map.entry("address", addr),
                    Map.entry("openingHours", openingHours != null ? openingHours : ""),
                    Map.entry("hasNitrox", hasNitrox),
                    Map.entry("hasOxygen", hasOxygen),
                    Map.entry("hasRental", hasRental),
                    Map.entry("hasCourses", hasCourses)
                ));
            }
        } catch (Exception e) {
            log.error("Failed to parse Overpass response", e);
        }
        return result;
    }

    private String buildAddress(JsonNode tags) {
        var parts = new ArrayList<String>();
        if (tags.has("addr:street")) {
            String street = tags.get("addr:street").asText();
            if (tags.has("addr:housenumber")) {
                street = tags.get("addr:housenumber").asText() + " " + street;
            }
            parts.add(street);
        }
        if (tags.has("addr:city")) parts.add(tags.get("addr:city").asText());
        if (tags.has("addr:postcode")) parts.add(tags.get("addr:postcode").asText());
        if (tags.has("addr:country")) parts.add(tags.get("addr:country").asText());
        return String.join(", ", parts);
    }
}
