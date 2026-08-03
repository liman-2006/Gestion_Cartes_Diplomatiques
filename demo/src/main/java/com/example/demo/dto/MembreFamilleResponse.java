package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class MembreFamilleResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String lienParente;
    private LocalDate dateNaissance;
    private Long expatrieId;
    private String expatrieNomComplet;
}