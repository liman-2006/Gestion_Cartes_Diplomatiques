package com.example.demo.dto;

import com.example.demo.enums.StatutRenouvellement;
import com.example.demo.enums.TypeRenouvellement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class RenouvellementResponse {

    private Long id;
    private Long expatrieId;
    private String expatrieNomComplet;
    private TypeRenouvellement typeRenouvellement;
    private LocalDate dateProgrammee;
    private StatutRenouvellement statut;
    private String notes;
    private Long carteGenereeId;
    private String carteGenereeNumero;
    private List<DocumentRenouvellementResponse> documents;
}
