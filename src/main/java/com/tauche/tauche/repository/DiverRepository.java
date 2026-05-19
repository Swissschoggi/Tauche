package com.tauche.tauche.repository;

import com.tauche.tauche.model.Diver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DiverRepository extends JpaRepository<Diver, Long> {
    Optional<Diver> findByEmail(String email);
}