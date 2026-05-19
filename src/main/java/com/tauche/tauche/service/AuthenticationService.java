package com.tauche.tauche.service;

import com.tauche.tauche.dto.AuthResponse;
import com.tauche.tauche.dto.LoginRequest;
import com.tauche.tauche.model.Diver;
import com.tauche.tauche.repository.DiverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final DiverRepository diverRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean authenticate(LoginRequest request) {
        Diver diver = diverRepository.findByEmail(request.getEmail())
                .orElse(null);
        
        if (diver == null) return false;

        return passwordEncoder.matches(request.getPassword(), diver.getPassword());
    }
}