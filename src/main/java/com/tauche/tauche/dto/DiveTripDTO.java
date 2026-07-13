package com.tauche.tauche.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiveTripDTO {
    
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String tripName;

    @Size(max = 2000)
    private String description;

    @NotBlank
    @Size(max = 500)
    private String destination;

    private Double latitude;
    private Double longitude;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DiveLogDTO> dives;
    private Integer diveCount;
    private Integer durationDays;
    private Double totalDepth;
    private Double totalDuration;
    private Double averageDepth;
    private Double averageTemperature;
}
