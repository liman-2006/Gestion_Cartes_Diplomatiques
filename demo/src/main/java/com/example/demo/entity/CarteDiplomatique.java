package com.example.demo.entity;

import com.example.demo.enums.StatutCarte;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "carte_diplomatique")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarteDiplomatique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroCarte;

    @Column(nullable = false)
    private LocalDate dateDelivrance;

    @Column(nullable = false)
    private LocalDate dateExpiration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCarte statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expatrie_id")
    private Expatrie expatrie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_famille_id")
    private MembreFamille membreFamille;
}