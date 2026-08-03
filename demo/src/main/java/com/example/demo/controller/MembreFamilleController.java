package com.example.demo.controller;

import com.example.demo.dto.MembreFamilleRequest;
import com.example.demo.dto.MembreFamilleResponse;
import com.example.demo.service.MembreFamilleService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membres-famille")
public class MembreFamilleController {

    private final MembreFamilleService membreFamilleService;

    public MembreFamilleController(MembreFamilleService membreFamilleService) {
        this.membreFamilleService = membreFamilleService;
    }

    @PostMapping
    public ResponseEntity<MembreFamilleResponse> creer(
            @Valid @RequestBody MembreFamilleRequest request
    ) {
        MembreFamilleResponse response = membreFamilleService.creer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MembreFamilleResponse>> listerTous() {
        return ResponseEntity.ok(membreFamilleService.listerTous());
    }

    @GetMapping("/expatrie/{expatrieId}")
    public ResponseEntity<List<MembreFamilleResponse>> listerParExpatrie(
            @PathVariable Long expatrieId
    ) {
        return ResponseEntity.ok(
                membreFamilleService.listerParExpatrie(expatrieId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembreFamilleResponse> trouverParId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(membreFamilleService.trouverParId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembreFamilleResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody MembreFamilleRequest request
    ) {
        return ResponseEntity.ok(
                membreFamilleService.modifier(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        membreFamilleService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}