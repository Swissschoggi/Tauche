package com.tauche.tauche.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tauche.tauche.model.DiveLog;

@Repository
public interface DiveLogRepository extends JpaRepository<DiveLog, Long> {
    List<DiveLog> findByDiverId(Long diverId);
    
    @Query("SELECT DISTINCT d FROM DiveLog d LEFT JOIN FETCH d.equipmentUsed WHERE d.diver.id = :diverId")
    List<DiveLog> findByDiverIdWithEquipment(@Param("diverId") Long diverId);
    Optional<DiveLog> findByShareToken(String shareToken);

}