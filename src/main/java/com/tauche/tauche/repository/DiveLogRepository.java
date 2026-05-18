package com.tauche.tauche.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tauche.tauche.model.DiveLog;

@Repository
public interface DiveLogRepository extends JpaRepository<DiveLog, Long> {
}