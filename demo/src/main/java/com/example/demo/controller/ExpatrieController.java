package com.example.demo.controller;

import com.example.demo.dto.ExpatrieRequest;
import com.example.demo.dto.ExpatrieResponse;
import com.example.demo.service.ExpatrieService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expatries")
public class ExpatrieController {

    private final ExpatrieService expatrieService;

    public ExpatrieController(ExpatrieService expatrieService) {
        this.expatrieService = expatrieService;
    }

    @PostMapping
    public ResponseEntity<ExpatrieResponse> creer(
            @Valid @RequestBody ExpatrieRequest request
    ) {
        ExpatrieResponse response = expatrieService.creer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ExpatrieResponse>> listerTous() {
        return ResponseEntity.ok(expatrieService.listerTous());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpatrieResponse> trouverParId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(expatrieService.trouverParId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpatrieResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody ExpatrieRequest request
    ) {
        return ResponseEntity.ok(expatrieService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        expatrieService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}