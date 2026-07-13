package com.tauche.tauche.repository;

import com.tauche.tauche.model.Certification;
import com.tauche.tauche.model.Diver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    
    List<Certification> findByDiverAndIsActiveTrue(Diver diver);
    
    @Query("SELECT c FROM Certification c WHERE c.diver = :diver AND " +
           "(c.expiryDate IS NULL OR c.expiryDate >= CURRENT_DATE)")
    List<Certification> findActiveCertifications(@Param("diver") Diver diver);
    
    @Query("SELECT c FROM Certification c WHERE c.diver = :diver AND " +
           "c.expiryDate IS NOT NULL AND c.expiryDate < :expiryDate")
    List<Certification> findExpiringCertifications(
        @Param("diver") Diver diver,
        @Param("expiryDate") LocalDate expiryDate
    );
}
