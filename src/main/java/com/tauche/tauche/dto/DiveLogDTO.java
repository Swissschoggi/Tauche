package com.tauche.tauche.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.tauche.tauche.model.DiveGas;
import com.tauche.tauche.model.DiveLog;
import com.tauche.tauche.model.DivePurpose;
import com.tauche.tauche.model.DiveType;
import com.tauche.tauche.model.WaterType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DiveLogDTO {
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String diveTitle;

    @NotNull
    private LocalDate date;

    @NotBlank
    @Size(max = 500)
    private String location;

    private Double latitude;
    private Double longitude;
    private DiveType diveType;
    private DivePurpose divePurpose;

    @Size(max = 200)
    private String diveSite;

    @NotNull
    @Positive
    private Double depthMeters;

    private Double cylinderVolumeLiters;

    @NotNull
    @Positive
    private Integer durationMinutes;

    private Double waterTemperatureCelsius;
    private Double visibilityMeters;
    private WaterType waterType;

    @Size(max = 100)
    private String weather;

    @Size(max = 100)
    private String suit;

    private Double weightKg;
    private DiveGas gas;
    private Double pressureStartBar;
    private Double pressureEndBar;

    @Size(max = 200)
    private String buddy;

    @Size(max = 200)
    private String diveCenter;

    @Size(max = 5000)
    private String notes;

    @Size(max = 500)
    private String imagePath;
    private List<SimpleEquipmentDTO> equipmentUsed = new ArrayList<>();
    private List<Long> equipmentIds = new ArrayList<>();

    public static DiveLogDTO fromEntity(DiveLog diveLog) {
    if (diveLog == null) return null;
    
    DiveLogDTO dto = new DiveLogDTO();
        dto.setId(diveLog.getId());
        dto.setDiveTitle(diveLog.getDiveTitle());
        dto.setDate(diveLog.getDate());
        dto.setLocation(diveLog.getLocation());
        dto.setLatitude(diveLog.getLatitude());
        dto.setLongitude(diveLog.getLongitude());
        dto.setDiveType(diveLog.getDiveType());
        dto.setDivePurpose(diveLog.getDivePurpose());
        dto.setDiveSite(diveLog.getDiveSite());
        dto.setDepthMeters(diveLog.getDepthMeters());
        dto.setCylinderVolumeLiters(diveLog.getCylinderVolumeLiters());
        dto.setDurationMinutes(diveLog.getDurationMinutes());
        dto.setWaterTemperatureCelsius(diveLog.getWaterTemperatureCelsius());
        dto.setVisibilityMeters(diveLog.getVisibilityMeters());
        dto.setWaterType(diveLog.getWaterType());
        dto.setWeather(diveLog.getWeather());
        dto.setSuit(diveLog.getSuit());
        dto.setWeightKg(diveLog.getWeightKg());
        dto.setGas(diveLog.getGas());
        dto.setPressureStartBar(diveLog.getPressureStartBar());
        dto.setPressureEndBar(diveLog.getPressureEndBar());
        dto.setBuddy(diveLog.getBuddy());
        dto.setDiveCenter(diveLog.getDiveCenter());
        dto.setNotes(diveLog.getNotes());
        dto.setImagePath(diveLog.getImagePath());
        
        if (diveLog.getEquipmentUsed() != null && !diveLog.getEquipmentUsed().isEmpty()) {
            List<SimpleEquipmentDTO> equipmentDTOs = diveLog.getEquipmentUsed().stream()
                    .map(SimpleEquipmentDTO::fromEntity)
                    .collect(java.util.stream.Collectors.toList());
            dto.setEquipmentUsed(equipmentDTOs);
            
            List<Long> ids = diveLog.getEquipmentUsed().stream()
                    .map(eq -> eq.getId())
                    .collect(java.util.stream.Collectors.toList());
            dto.setEquipmentIds(ids);
        } else {
            dto.setEquipmentUsed(new ArrayList<>());
            dto.setEquipmentIds(new ArrayList<>());
        }
        
        return dto;
    }

    public DiveLog toEntity() {
        DiveLog diveLog = new DiveLog();
        diveLog.setId(this.id);
        diveLog.setDiveTitle(this.diveTitle);
        diveLog.setDate(this.date);
        diveLog.setLocation(this.location);
        diveLog.setLatitude(this.latitude);
        diveLog.setLongitude(this.longitude);
        diveLog.setDiveType(this.diveType);
        diveLog.setDivePurpose(this.divePurpose);
        diveLog.setDiveSite(this.diveSite);
        diveLog.setDepthMeters(this.depthMeters);
        diveLog.setCylinderVolumeLiters(this.cylinderVolumeLiters);
        diveLog.setDurationMinutes(this.durationMinutes);
        diveLog.setWaterTemperatureCelsius(this.waterTemperatureCelsius);
        diveLog.setVisibilityMeters(this.visibilityMeters);
        diveLog.setWaterType(this.waterType);
        diveLog.setWeather(this.weather);
        diveLog.setSuit(this.suit);
        diveLog.setWeightKg(this.weightKg);
        diveLog.setGas(this.gas);
        diveLog.setPressureStartBar(this.pressureStartBar);
        diveLog.setPressureEndBar(this.pressureEndBar);
        diveLog.setBuddy(this.buddy);
        diveLog.setDiveCenter(this.diveCenter);
        diveLog.setNotes(this.notes);
        diveLog.setImagePath(this.imagePath);
        return diveLog;
    }
}