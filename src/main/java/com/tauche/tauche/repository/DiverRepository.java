package com.tauche.tauche.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tauche.tauche.model.Diver;

public interface DiverRepository extends JpaRepository<Diver, Long> {
    Optional<Diver> findByEmail(String email);

    List<Diver> findByEmailContainingIgnoreCase(String email);

    List<Diver> findByRole(String role);

    long countByRole(String role);
}