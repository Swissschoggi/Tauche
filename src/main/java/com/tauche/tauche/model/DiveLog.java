package com.tauche.tauche.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(exclude = {"equipmentUsed", "diver", "galleryImages"})
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
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String diveTitle;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String location;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private DiveType diveType;

    @Enumerated(EnumType.STRING)
    private DivePurpose divePurpose;

    @Size(max = 200)
    @Column(length = 200)
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

    @Size(max = 100)
    @Column(length = 100)
    private String weather;

    @Size(max = 100)
    @Column(length = 100)
    private String suit;

    private Double weightKg;

    @Enumerated(EnumType.STRING)
    private DiveGas gas;

    private Double pressureStartBar;
    private Double pressureEndBar;

    @Size(max = 200)
    @Column(length = 200)
    private String buddy;

    @Size(max = 200)
    @Column(length = 200)
    private String diveCenter;

    @Size(max = 5000)
    @Column(length = 5000)
    private String notes;

    @Size(max = 500)
    @Column(length = 500)
    private String imagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diver_id", nullable = false)
    @JsonIgnore
    private Diver diver;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
        name = "dive_log_equipment",
        joinColumns = @JoinColumn(name = "dive_log_id"),
        inverseJoinColumns = @JoinColumn(name = "equipment_id")
    )
    private Set<Equipment> equipmentUsed = new HashSet<>();

    @Column(name = "share_token", unique = true)
    private String shareToken;

    @OneToMany(mappedBy = "diveLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<GalleryImage> galleryImages = new ArrayList<>();

    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }
}