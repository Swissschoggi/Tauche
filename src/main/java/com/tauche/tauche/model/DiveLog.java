package com.tauche.tauche.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Entity
@Table(name = "dive_logs")
public class DiveLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    //Padi Logbook was used as reference for the entities

    //Basic info
    @NotBlank
    private String diveTitle;

    @NotNull
    private LocalDate date;

    @NotBlank
    private String location;

    @NotBlank
    private String diveSite;

    @Enumerated(EnumType.STRING)
    private DiveType diveType;

    //Dive stats
    @NotNull
    @Positive
    private Double depthMeters;

    @NotNull
    @Positive
    private Integer durationMinutes;

    private Double waterTemperatureCelsius;
    private Double visibilityMeters;

    //Conditions
    @Enumerated(EnumType.STRING)
    private WaterType waterType;

    private String weather;

    //Equipment
    private String suit;
    private Double weightKg;
    private String gas;
    private Integer pressureStartBar;
    private Integer pressureEndBar;

    //People
    private String buddy;
    private String diveCenter;

    //Notes
    @Column(length = 2000)
    private String notes;
}