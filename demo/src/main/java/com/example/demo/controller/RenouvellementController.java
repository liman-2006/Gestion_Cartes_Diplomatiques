package com.example.demo.controller;

import com.example.demo.dto.DocumentRenouvellementRequest;
import com.example.demo.dto.RenouvellementRequest;
import com.example.demo.dto.RenouvellementResponse;
import com.example.demo.service.RenouvellementService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/renouvellements")
public class RenouvellementController {

    private final RenouvellementService renouvellementService;

    public RenouvellementController(RenouvellementService renouvellementService) {
        this.renouvellementService = renouvellementService;
    }

    @PostMapping
    public ResponseEntity<RenouvellementResponse> creer(
            @Valid @RequestBody RenouvellementRequest request
    ) {
        RenouvellementResponse response = renouvellementService.creer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<RenouvellementResponse>> listerTous() {
        return ResponseEntity.ok(renouvellementService.listerTous());
    }

    @GetMapping("/expatrie/{expatrieId}")
    public ResponseEntity<List<RenouvellementResponse>> listerParExpatrie(
            @PathVariable Long expatrieId
    ) {
        return ResponseEntity.ok(renouvellementService.listerParExpatrie(expatrieId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RenouvellementResponse> trouverParId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(renouvellementService.trouverParId(id));
    }

    @PreAuthorize("hasRole('RESPONSABLE')")
    @PutMapping("/{id}")
    public ResponseEntity<RenouvellementResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody RenouvellementRequest request
    ) {
        return ResponseEntity.ok(renouvellementService.modifier(id, request));
    }

    @PreAuthorize("hasRole('RESPONSABLE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        renouvellementService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<RenouvellementResponse> ajouterDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentRenouvellementRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(renouvellementService.ajouterDocument(id, request));
    }

    @PatchMapping("/documents/{documentId}/basculer")
    public ResponseEntity<RenouvellementResponse> basculerDocumentRecu(
            @PathVariable Long documentId
    ) {
        return ResponseEntity.ok(renouvellementService.basculerDocumentRecu(documentId));
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<RenouvellementResponse> supprimerDocument(
            @PathVariable Long documentId
    ) {
        return ResponseEntity.ok(renouvellementService.supprimerDocument(documentId));
    }
}
