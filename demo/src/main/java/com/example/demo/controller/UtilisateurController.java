package com.example.demo.controller;

import com.example.demo.dto.UtilisateurRequest;
import com.example.demo.dto.UtilisateurResponse;
import com.example.demo.service.UtilisateurService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@PreAuthorize("hasRole('RESPONSABLE')")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @PostMapping
    public ResponseEntity<UtilisateurResponse> creer(
            @Valid @RequestBody UtilisateurRequest request
    ) {
        UtilisateurResponse response = utilisateurService.creer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurResponse>> listerTous() {
        return ResponseEntity.ok(utilisateurService.listerTous());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> trouverParId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(utilisateurService.trouverParId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody UtilisateurRequest request
    ) {
        return ResponseEntity.ok(utilisateurService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        utilisateurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
