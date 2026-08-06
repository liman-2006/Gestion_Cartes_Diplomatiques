package com.example.demo.config;

import com.example.demo.entity.Role;
import com.example.demo.entity.Utilisateur;
import com.example.demo.enums.RoleType;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleRepository roleRepository,
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // Création des rôles
        Role responsableRole = roleRepository.findByNom(RoleType.RESPONSABLE)
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .nom(RoleType.RESPONSABLE)
                                        .build()
                        )
                );

        roleRepository.findByNom(RoleType.AGENT)
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .nom(RoleType.AGENT)
                                        .build()
                        )
                );

        // Création du responsable logistique (super administrateur)
        if (!utilisateurRepository.existsByEmail("admin@ecobank.com")) {

            Utilisateur responsable = Utilisateur.builder()
                    .nom("Administrateur")
                    .prenom("Système")
                    .email("admin@ecobank.com")
                    .motDePasse(passwordEncoder.encode("Admin@123"))
                    .actif(true)
                    .role(responsableRole)
                    .build();

            utilisateurRepository.save(responsable);

            System.out.println("======================================");
            System.out.println(" Responsable logistique créé avec succès !");
            System.out.println(" Email : admin@ecobank.com");
            System.out.println(" Mot de passe : Admin@123");
            System.out.println("======================================");
        }
    }
}