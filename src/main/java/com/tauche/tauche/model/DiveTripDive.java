package com.tauche.tauche.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dive_trip_dives")
public class DiveTripDive {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dive_trip_id", nullable = false)
    private DiveTrip diveTrip;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dive_log_id", nullable = false)
    private DiveLog diveLog;
    
    private Integer sequence;
}
