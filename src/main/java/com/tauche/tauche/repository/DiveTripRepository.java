package com.tauche.tauche.repository;

import com.tauche.tauche.model.DiveTrip;
import com.tauche.tauche.model.Diver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiveTripRepository extends JpaRepository<DiveTrip, Long> {
    
    List<DiveTrip> findByDiverAndIsActiveTrue(Diver diver);
    
    @Query("SELECT t FROM DiveTrip t WHERE t.diver = :diver AND t.startDate <= :date AND t.endDate >= :date")
    List<DiveTrip> findTripsContainingDate(
        @Param("diver") Diver diver,
        @Param("date") LocalDate date
    );
    
    @Query("SELECT t FROM DiveTrip t WHERE t.diver = :diver AND t.startDate >= CURRENT_DATE ORDER BY t.startDate")
    List<DiveTrip> findUpcomingTrips(@Param("diver") Diver diver);

    long count();
}
