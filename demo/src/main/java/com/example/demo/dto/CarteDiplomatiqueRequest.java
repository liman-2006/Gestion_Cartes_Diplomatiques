package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CarteDiplomatiqueRequest {

    @NotBlank(message = "Le numéro de carte est obligatoire")
    private String numeroCarte;

    @NotNull(message = "La date de délivrance est obligatoire")
    @PastOrPresent(message = "La date de délivrance ne peut pas être dans le futur")
    private LocalDate dateDelivrance;

    private Long expatrieId;

    private Long membreFamilleId;

    private Long renouvellementId;
}
