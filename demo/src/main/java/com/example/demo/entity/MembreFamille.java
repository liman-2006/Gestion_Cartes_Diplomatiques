package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "membres_famille")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreFamille {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String lienParente;

    private LocalDate dateNaissance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expatrie_id", nullable = false)
    private Expatrie expatrie;
}