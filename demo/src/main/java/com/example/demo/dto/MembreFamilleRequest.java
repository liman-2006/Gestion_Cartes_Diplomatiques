package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MembreFamilleRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Pattern(regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$", message = "Le nom ne doit pas contenir de chiffres")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Pattern(regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$", message = "Le prénom ne doit pas contenir de chiffres")
    private String prenom;

    @NotBlank(message = "Le lien de parenté est obligatoire")
    private String lienParente;

    @NotNull(message = "La date de naissance est obligatoire")
    @PastOrPresent(message = "La date de naissance ne peut pas être postérieure à aujourd'hui")
    private LocalDate dateNaissance;

    @NotNull(message = "L'identifiant de l'expatrié est obligatoire")
    private Long expatrieId;
}