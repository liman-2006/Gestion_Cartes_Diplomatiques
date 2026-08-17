package com.example.demo.dto;

import com.example.demo.enums.TypeRenouvellement;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RenouvellementRequest {

    @NotNull(message = "L'identifiant de l'expatrié est obligatoire")
    private Long expatrieId;

    @NotNull(message = "Le type de renouvellement est obligatoire")
    private TypeRenouvellement typeRenouvellement;

    @NotNull(message = "La date programmée est obligatoire")
    @FutureOrPresent(message = "La date programmée ne peut pas être antérieure à aujourd'hui")
    private LocalDate dateProgrammee;

    private String notes;
}
