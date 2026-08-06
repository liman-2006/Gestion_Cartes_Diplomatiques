package com.example.demo.service;

import com.example.demo.dto.UtilisateurRequest;
import com.example.demo.dto.UtilisateurResponse;
import com.example.demo.entity.Role;
import com.example.demo.entity.Utilisateur;
import com.example.demo.enums.RoleType;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UtilisateurRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(
            UtilisateurRepository utilisateurRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UtilisateurResponse creer(UtilisateurRequest request) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Un utilisateur avec cet email existe déjà."
            );
        }

        if (request.getMotDePasse() == null || request.getMotDePasse().isBlank()) {
            throw new IllegalArgumentException(
                    "Le mot de passe est obligatoire à la création."
            );
        }

        Role role = trouverRole(request.getRole());

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .actif(request.isActif())
                .role(role)
                .build();

        Utilisateur sauvegarde = utilisateurRepository.save(utilisateur);

        return versResponse(sauvegarde);
    }

    public List<UtilisateurResponse> listerTous() {
        return utilisateurRepository.findAll()
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public UtilisateurResponse trouverParId(Long id) {
        return versResponse(trouverEntiteParId(id));
    }

    public UtilisateurResponse modifier(Long id, UtilisateurRequest request) {

        Utilisateur utilisateur = trouverEntiteParId(id);

        if (!utilisateur.getEmail().equals(request.getEmail())
                && utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Un utilisateur avec cet email existe déjà."
            );
        }

        if (utilisateur.getRole().getNom() == RoleType.RESPONSABLE
                && request.getRole() != RoleType.RESPONSABLE
                && utilisateurRepository.countByRoleNomAndActifTrue(RoleType.RESPONSABLE) <= 1) {
            throw new IllegalArgumentException(
                    "Impossible de retirer le rôle RESPONSABLE au dernier responsable actif."
            );
        }

        Role role = trouverRole(request.getRole());

        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setActif(request.isActif());
        utilisateur.setRole(role);

        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        Utilisateur sauvegarde = utilisateurRepository.save(utilisateur);

        return versResponse(sauvegarde);
    }

    public void supprimer(Long id) {

        Utilisateur utilisateur = trouverEntiteParId(id);

        if (utilisateur.getRole().getNom() == RoleType.RESPONSABLE
                && utilisateurRepository.countByRoleNomAndActifTrue(RoleType.RESPONSABLE) <= 1) {
            throw new IllegalArgumentException(
                    "Impossible de supprimer le dernier responsable actif."
            );
        }

        utilisateurRepository.deleteById(id);
    }

    private Utilisateur trouverEntiteParId(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec l'id : " + id
                ));
    }

    private Role trouverRole(RoleType roleType) {
        return roleRepository.findByNom(roleType)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Rôle introuvable : " + roleType
                ));
    }

    private UtilisateurResponse versResponse(Utilisateur utilisateur) {
        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .email(utilisateur.getEmail())
                .actif(utilisateur.isActif())
                .role(utilisateur.getRole().getNom())
                .build();
    }
}
