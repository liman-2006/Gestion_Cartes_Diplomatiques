package com.example.demo.dto;

import com.example.demo.enums.RoleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class UtilisateurResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private boolean actif;
    private RoleType role;
}
