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
public class ExpatrieResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String matricule;
    private String email;
    private String telephone;
    private LocalDate dateArrivee;
    private boolean actif;
}