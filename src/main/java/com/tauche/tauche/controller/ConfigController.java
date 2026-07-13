package com.tauche.tauche.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Collections;
import java.util.Map;

@RestController
public class ConfigController {

    @Value("${BACKEND_PORT:8080}")
    private String backendPort;

    @GetMapping("/api/config")
    public Map<String, String> getConfig() {
        return Collections.singletonMap("BACKEND_PORT", backendPort);
    }
}