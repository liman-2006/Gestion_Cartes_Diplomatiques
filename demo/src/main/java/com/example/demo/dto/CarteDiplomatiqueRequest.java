package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CarteDiplomatiqueRequest {

    @NotBlank(message = "Le numéro de carte est obligatoire")
    private String numeroCarte;

    @NotNull(message = "La date de délivrance est obligatoire")
    private LocalDate dateDelivrance;

    @NotNull(message = "La date d'expiration est obligatoire")
    private LocalDate dateExpiration;

    private Long expatrieId;

    private Long membreFamilleId;

    private Long renouvellementId;
}
