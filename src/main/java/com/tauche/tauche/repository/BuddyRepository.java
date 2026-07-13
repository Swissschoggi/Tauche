package com.tauche.tauche.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tauche.tauche.model.Buddy;
import com.tauche.tauche.model.Diver;

public interface BuddyRepository extends JpaRepository<Buddy, Long> {

    List<Buddy> findByDiverAndStatus(Diver diver, String status);

    List<Buddy> findByBuddyAndStatus(Diver buddy, String status);

    Optional<Buddy> findByDiverAndBuddy(Diver diver, Diver buddy);

    boolean existsByDiverAndBuddy(Diver diver, Diver buddy);

    long countByDiver(Diver diver);

    long countByBuddy(Diver buddy);
}
