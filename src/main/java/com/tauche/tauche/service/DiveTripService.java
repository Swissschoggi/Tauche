package com.tauche.tauche.service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tauche.tauche.dto.DiveLogDTO;
import com.tauche.tauche.dto.DiveTripDTO;
import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.model.DiveTrip;
import com.tauche.tauche.model.DiveTripDive;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiveLogRepository;
import com.tauche.tauche.repository.DiveTripRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DiveTripService {
    
    @Autowired
    private DiveTripRepository diveTripRepository;
    
    @Autowired
    private DiveLogRepository diveLogRepository;
    
    public DiveTripDTO createTrip(Diver diver, DiveTripDTO dto) {
        DiveTrip trip = DiveTrip.builder()
            .diver(diver)
            .tripName(dto.getTripName())
            .description(dto.getDescription())
            .destination(dto.getDestination())
            .latitude(dto.getLatitude())
            .longitude(dto.getLongitude())
            .startDate(dto.getStartDate())
            .endDate(dto.getEndDate())
            .isActive(true)
            .build();
        
        return mapToDTO(diveTripRepository.save(trip));
    }
    
    public List<DiveTripDTO> getUserTrips(Diver diver) {
        return diveTripRepository.findByDiverAndIsActiveTrue(diver)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<DiveTripDTO> getUpcomingTrips(Diver diver) {
        return diveTripRepository.findUpcomingTrips(diver)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public DiveTripDTO getTripById(Long tripId, Diver diver) {
        DiveTrip trip = diveTripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getDiver().getId().equals(diver.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        return mapToDTO(trip);
    }
    
    public DiveTripDTO updateTrip(Long tripId, Diver diver, DiveTripDTO dto) {
        DiveTrip trip = diveTripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getDiver().getId().equals(diver.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        trip.setTripName(dto.getTripName());
        trip.setDescription(dto.getDescription());
        trip.setDestination(dto.getDestination());
        trip.setLatitude(dto.getLatitude());
        trip.setLongitude(dto.getLongitude());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        
        return mapToDTO(diveTripRepository.save(trip));
    }
    
    public void deleteTrip(Long tripId, Diver diver) {
        DiveTrip trip = diveTripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getDiver().getId().equals(diver.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        diveTripRepository.delete(trip);
    }
    
    public void addDiveToTrip(Long tripId, Long diveId, Diver diver) {
        DiveTrip trip = diveTripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getDiver().getId().equals(diver.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        DiveLog dive = diveLogRepository.findById(diveId)
            .orElseThrow(() -> new RuntimeException("Dive not found"));
        
        if (!dive.getDiver().getId().equals(diver.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        DiveTripDive tripDive = DiveTripDive.builder()
            .diveTrip(trip)
            .diveLog(dive)
            .sequence(trip.getDiveTripDives().size() + 1)
            .build();
        
        trip.getDiveTripDives().add(tripDive);
        diveTripRepository.save(trip);
    }
    
    public void removeDiveFromTrip(Long tripId, Long diveId, Diver diver) {
        DiveTrip trip = diveTripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getDiver().getId().equals(diver.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        trip.getDiveTripDives().removeIf(td -> td.getDiveLog().getId().equals(diveId));
        diveTripRepository.save(trip);
    }
    
    private DiveTripDTO mapToDTO(DiveTrip trip) {
        List<DiveLogDTO> dives = trip.getDiveTripDives().stream()
            .sorted((a, b) -> {
                int seqA = a.getSequence() != null ? a.getSequence() : 0;
                int seqB = b.getSequence() != null ? b.getSequence() : 0;
                return Integer.compare(seqA, seqB);
            })
            .map(td -> DiveLogDTO.fromEntity(td.getDiveLog()))
            .collect(Collectors.toList());
        
        double totalDepth = dives.stream()
            .mapToDouble(d -> d.getDepthMeters() != null ? d.getDepthMeters() : 0)
            .sum();
        
        double totalDuration = dives.stream()
            .mapToDouble(d -> d.getDurationMinutes() != null ? d.getDurationMinutes() : 0)
            .sum();
        
        double averageDepth = dives.isEmpty() ? 0 : totalDepth / dives.size();
        
        double averageTemperature = dives.stream()
            .mapToDouble(d -> d.getWaterTemperatureCelsius() != null ? d.getWaterTemperatureCelsius() : 0)
            .average()
            .orElse(0);
        
        long durationDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        
        return DiveTripDTO.builder()
            .id(trip.getId())
            .tripName(trip.getTripName())
            .description(trip.getDescription())
            .destination(trip.getDestination())
            .latitude(trip.getLatitude())
            .longitude(trip.getLongitude())
            .startDate(trip.getStartDate())
            .endDate(trip.getEndDate())
            .dives(dives)
            .diveCount(dives.size())
            .durationDays((int) durationDays)
            .totalDepth(totalDepth)
            .totalDuration(totalDuration)
            .averageDepth(averageDepth)
            .averageTemperature(averageTemperature)
            .build();
    }
}
