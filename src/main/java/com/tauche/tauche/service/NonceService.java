package com.tauche.tauche.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class NonceService {

    private static final long NONCE_TTL_MS = 2 * 60 * 1000;

    private record NonceEntry(String nonce, long expiresAt) {}

    private final Map<String, NonceEntry> store = new ConcurrentHashMap<>();

    private final SecureRandom random = new SecureRandom();

    public String generate(String email) {
        byte[] bytes = new byte[24];
        random.nextBytes(bytes);
        String nonce = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        store.put(email, new NonceEntry(nonce, System.currentTimeMillis() + NONCE_TTL_MS));
        return nonce;
    }

    public boolean validateAndConsume(String email, String nonce) {
        NonceEntry entry = store.remove(email);
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expiresAt()) return false;
        return entry.nonce().equals(nonce);
    }
}