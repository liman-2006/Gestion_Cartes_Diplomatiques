package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ExpatrieRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Pattern(regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$", message = "Le nom ne doit pas contenir de chiffres")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Pattern(regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$", message = "Le prénom ne doit pas contenir de chiffres")
    private String prenom;

    @NotBlank(message = "Le matricule est obligatoire")
    private String matricule;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[0-9]+$", message = "Le téléphone ne doit contenir que des chiffres")
    private String telephone;

    @NotNull(message = "La date d'arrivée est obligatoire")
    @PastOrPresent(message = "La date d'arrivée ne peut pas être dans le futur")
    private LocalDate dateArrivee;
}