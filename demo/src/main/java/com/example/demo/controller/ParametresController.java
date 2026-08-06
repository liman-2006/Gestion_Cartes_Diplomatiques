package com.example.demo.controller;

import com.example.demo.dto.ParametresRequest;
import com.example.demo.dto.ParametresResponse;
import com.example.demo.service.ParametresService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parametres")
public class ParametresController {

    private final ParametresService parametresService;

    public ParametresController(ParametresService parametresService) {
        this.parametresService = parametresService;
    }

    @GetMapping
    public ResponseEntity<ParametresResponse> obtenir() {
        return ResponseEntity.ok(parametresService.obtenir());
    }

    @PreAuthorize("hasRole('RESPONSABLE')")
    @PutMapping
    public ResponseEntity<ParametresResponse> modifier(
            @Valid @RequestBody ParametresRequest request
    ) {
        return ResponseEntity.ok(parametresService.modifier(request));
    }
}
