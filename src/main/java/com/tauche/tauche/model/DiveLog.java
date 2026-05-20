package com.tauche.tauche.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dive_logs")
public class DiveLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String diveTitle;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @NotBlank
    @Column(nullable = false)
    private String location;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private DiveType diveType;

    @Enumerated(EnumType.STRING)
    private DivePurpose divePurpose;

    private String diveSite;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double depthMeters;

    private Double cylinderVolumeLiters;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer durationMinutes;

    private Double waterTemperatureCelsius;
    private Double visibilityMeters;

    @Enumerated(EnumType.STRING)
    private WaterType waterType;

    private String weather;
    private String suit;
    private Double weightKg;

    @Enumerated(EnumType.STRING)
    private DiveGas gas;

    private Double pressureStartBar;
    private Double pressureEndBar;

    private String buddy;
    private String diveCenter;

    @Column(length = 2000)
    private String notes;

    private String imagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diver_id", nullable = false)
    @JsonIgnore
    private Diver diver;
}