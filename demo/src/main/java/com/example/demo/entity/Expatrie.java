package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "expatries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expatrie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String matricule;

    private String email;

    private String telephone;

    private LocalDate dateArrivee;

    @Column(nullable = false)
    private boolean actif = true;

    @OneToMany(
            mappedBy = "expatrie",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<MembreFamille> membresFamille;
}