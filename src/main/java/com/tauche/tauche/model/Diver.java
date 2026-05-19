package com.tauche.tauche.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "divers")
@Data
public class Diver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(length = 60)
    private String password;
}