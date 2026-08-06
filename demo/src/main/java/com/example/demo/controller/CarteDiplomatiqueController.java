package com.example.demo.controller;

import com.example.demo.dto.CarteDiplomatiqueRequest;
import com.example.demo.dto.CarteDiplomatiqueResponse;
import com.example.demo.service.CarteDiplomatiqueService;
import com.example.demo.service.StatutCarteSchedulerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cartes")
public class CarteDiplomatiqueController {

    private final CarteDiplomatiqueService carteDiplomatiqueService;
    private final StatutCarteSchedulerService statutCarteSchedulerService;

    public CarteDiplomatiqueController(
            CarteDiplomatiqueService carteDiplomatiqueService,
            StatutCarteSchedulerService statutCarteSchedulerService
    ) {
        this.carteDiplomatiqueService = carteDiplomatiqueService;
        this.statutCarteSchedulerService = statutCarteSchedulerService;
    }

    @PreAuthorize("hasRole('RESPONSABLE')")
    @PostMapping("/recalculer-statuts")
    public ResponseEntity<Map<String, Integer>> recalculerStatuts() {
        int cartesModifiees = statutCarteSchedulerService.recalculerEtAppliquer();
        return ResponseEntity.ok(Map.of("cartesModifiees", cartesModifiees));
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

    @PreAuthorize("hasRole('RESPONSABLE')")
    @PutMapping("/{id}")
    public ResponseEntity<CarteDiplomatiqueResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody CarteDiplomatiqueRequest request
    ) {
        return ResponseEntity.ok(carteDiplomatiqueService.modifier(id, request));
    }

    @PreAuthorize("hasRole('RESPONSABLE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        carteDiplomatiqueService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
