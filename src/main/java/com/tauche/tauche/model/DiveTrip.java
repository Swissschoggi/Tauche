package com.tauche.tauche.model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dive_trips")
public class DiveTrip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diver_id", nullable = false)
    private Diver diver;
    
    @NotBlank
    @Column(nullable = false)
    private String tripName;
    
    @Column(length = 500)
    private String description;
    
    @NotBlank
    @Column(nullable = false)
    private String destination;
    
    private Double latitude;
    private Double longitude;
    
    @NotNull
    @Column(nullable = false)
    private LocalDate startDate;
    
    @NotNull
    @Column(nullable = false)
    private LocalDate endDate;
    
    @Builder.Default
    @OneToMany(mappedBy = "diveTrip", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DiveTripDive> diveTripDives = new HashSet<>();
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDate createdAt = LocalDate.now();
    
    private LocalDate updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }
}
