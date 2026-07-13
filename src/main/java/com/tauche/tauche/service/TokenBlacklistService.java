package com.tauche.tauche.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    private final com.tauche.tauche.config.JwtService jwtService;

    public TokenBlacklistService(com.tauche.tauche.config.JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void blacklist(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    @Scheduled(fixedRate = 300_000)
    public void evictExpired() {
        long now = System.currentTimeMillis();
        blacklistedTokens.removeIf(token -> {
            try {
                Claims claims = Jwts.parser()
                    .verifyWith(jwtService.getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
                return claims.getExpiration().getTime() < now;
            } catch (Exception e) {
                return true;
            }
        });
    }
}