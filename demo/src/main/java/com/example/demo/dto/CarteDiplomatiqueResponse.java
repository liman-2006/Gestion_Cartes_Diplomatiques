package com.example.demo.dto;

import com.example.demo.enums.StatutCarte;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class CarteDiplomatiqueResponse {

    private Long id;
    private String numeroCarte;
    private LocalDate dateDelivrance;
    private LocalDate dateExpiration;
    private StatutCarte statut;
    private Long expatrieId;
    private String expatrieNomComplet;
    private Long membreFamilleId;
    private String membreFamilleNomComplet;
}
