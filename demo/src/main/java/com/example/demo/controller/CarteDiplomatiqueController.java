package com.example.demo.controller;

import com.example.demo.dto.CarteDiplomatiqueRequest;
import com.example.demo.dto.CarteDiplomatiqueResponse;
import com.example.demo.service.CarteDiplomatiqueService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cartes")
public class CarteDiplomatiqueController {

    private final CarteDiplomatiqueService carteDiplomatiqueService;

    public CarteDiplomatiqueController(CarteDiplomatiqueService carteDiplomatiqueService) {
        this.carteDiplomatiqueService = carteDiplomatiqueService;
    }

    @PostMapping
    public ResponseEntity<CarteDiplomatiqueResponse> creer(
            @Valid @RequestBody CarteDiplomatiqueRequest request
    ) {
        CarteDiplomatiqueResponse response = carteDiplomatiqueService.creer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CarteDiplomatiqueResponse>> listerTous() {
        return ResponseEntity.ok(carteDiplomatiqueService.listerTous());
    }

    @GetMapping("/expatrie/{expatrieId}")
    public ResponseEntity<List<CarteDiplomatiqueResponse>> listerParExpatrie(
            @PathVariable Long expatrieId
    ) {
        return ResponseEntity.ok(carteDiplomatiqueService.listerParExpatrie(expatrieId));
    }

    @GetMapping("/membre-famille/{membreFamilleId}")
    public ResponseEntity<List<CarteDiplomatiqueResponse>> listerParMembreFamille(
            @PathVariable Long membreFamilleId
    ) {
        return ResponseEntity.ok(carteDiplomatiqueService.listerParMembreFamille(membreFamilleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarteDiplomatiqueResponse> trouverParId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(carteDiplomatiqueService.trouverParId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarteDiplomatiqueResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody CarteDiplomatiqueRequest request
    ) {
        return ResponseEntity.ok(carteDiplomatiqueService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        carteDiplomatiqueService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
