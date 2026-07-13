package com.tauche.tauche.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tauche.tauche.model.Diver;
import com.tauche.tauche.model.Equipment;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByDiverAndIsActiveTrue(Diver diver);

    long count();

    @Query("SELECT COUNT(d) FROM DiveLog d JOIN d.equipmentUsed e WHERE e.id = :equipmentId")
    long countTotalDivesByEquipmentId(@Param("equipmentId") Long equipmentId);

    @Query("SELECT COALESCE(SUM(d.durationMinutes), 0) FROM DiveLog d JOIN d.equipmentUsed e WHERE e.id = :equipmentId")
    long sumTotalMinutesByEquipmentId(@Param("equipmentId") Long equipmentId);

    @Query("SELECT COUNT(d) FROM DiveLog d JOIN d.equipmentUsed e WHERE e.id = :equipmentId AND d.date >= :lastServiceDate")
    long countDivesSinceService(@Param("equipmentId") Long equipmentId, @Param("lastServiceDate") LocalDate lastServiceDate);
}