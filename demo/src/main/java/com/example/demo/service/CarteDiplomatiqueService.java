package com.example.demo.service;

import com.example.demo.dto.CarteDiplomatiqueRequest;
import com.example.demo.dto.CarteDiplomatiqueResponse;
import com.example.demo.entity.CarteDiplomatique;
import com.example.demo.entity.Expatrie;
import com.example.demo.entity.MembreFamille;
import com.example.demo.entity.Parametres;
import com.example.demo.entity.Renouvellement;
import com.example.demo.enums.StatutCarte;
import com.example.demo.enums.StatutRenouvellement;
import com.example.demo.repository.CarteDiplomatiqueRepository;
import com.example.demo.repository.ExpatrieRepository;
import com.example.demo.repository.MembreFamilleRepository;
import com.example.demo.repository.ParametresRepository;
import com.example.demo.repository.RenouvellementRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CarteDiplomatiqueService {

    private static final int SEUIL_PAR_DEFAUT_JOURS = 30;

    private final CarteDiplomatiqueRepository carteRepository;
    private final ExpatrieRepository expatrieRepository;
    private final MembreFamilleRepository membreFamilleRepository;
    private final ParametresRepository parametresRepository;
    private final RenouvellementRepository renouvellementRepository;

    public CarteDiplomatiqueService(
            CarteDiplomatiqueRepository carteRepository,
            ExpatrieRepository expatrieRepository,
            MembreFamilleRepository membreFamilleRepository,
            ParametresRepository parametresRepository,
            RenouvellementRepository renouvellementRepository
    ) {
        this.carteRepository = carteRepository;
        this.expatrieRepository = expatrieRepository;
        this.membreFamilleRepository = membreFamilleRepository;
        this.parametresRepository = parametresRepository;
        this.renouvellementRepository = renouvellementRepository;
    }

    @Transactional
    public CarteDiplomatiqueResponse creer(CarteDiplomatiqueRequest request) {

        if (carteRepository.existsByNumeroCarte(request.getNumeroCarte())) {
            throw new IllegalArgumentException(
                    "Une carte avec ce numéro existe déjà."
            );
        }

        Expatrie expatrie = resoudreBeneficiaires(request);
        MembreFamille membreFamille = null;

        if (request.getMembreFamilleId() != null) {
            membreFamille = membreFamilleRepository.findById(request.getMembreFamilleId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Membre de famille introuvable avec l'id : " + request.getMembreFamilleId()
                    ));
        }

        CarteDiplomatique carte = CarteDiplomatique.builder()
                .numeroCarte(request.getNumeroCarte())
                .dateDelivrance(request.getDateDelivrance())
                .dateExpiration(request.getDateExpiration())
                .statut(calculerStatut(request.getDateExpiration()))
                .expatrie(expatrie)
                .membreFamille(membreFamille)
                .build();

        CarteDiplomatique sauvegarde = carteRepository.save(carte);

        if (request.getRenouvellementId() != null) {
            rattacherCarteGeneree(request.getRenouvellementId(), sauvegarde);
        }

        return versResponse(sauvegarde);
    }

    private void rattacherCarteGeneree(Long renouvellementId, CarteDiplomatique carteGeneree) {

        Renouvellement renouvellement = renouvellementRepository.findById(renouvellementId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Renouvellement introuvable avec l'id : " + renouvellementId
                ));

        if (renouvellement.getStatut() != StatutRenouvellement.COMPLETE) {
            throw new IllegalArgumentException(
                    "Le renouvellement doit être terminé (tous les documents reçus) avant de créer la nouvelle carte."
            );
        }

        renouvellement.setCarteGeneree(carteGeneree);
        renouvellementRepository.save(renouvellement);
    }

    public List<CarteDiplomatiqueResponse> listerTous() {
        return carteRepository.findAll()
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public List<CarteDiplomatiqueResponse> listerParExpatrie(Long expatrieId) {
        return carteRepository.findByExpatrieId(expatrieId)
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public List<CarteDiplomatiqueResponse> listerParMembreFamille(Long membreFamilleId) {
        return carteRepository.findByMembreFamilleId(membreFamilleId)
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public CarteDiplomatiqueResponse trouverParId(Long id) {
        CarteDiplomatique carte = carteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Carte introuvable avec l'id : " + id
                ));
        return versResponse(carte);
    }

    public CarteDiplomatiqueResponse modifier(Long id, CarteDiplomatiqueRequest request) {

        CarteDiplomatique carte = carteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Carte introuvable avec l'id : " + id
                ));

        if (!carte.getNumeroCarte().equals(request.getNumeroCarte())
                && carteRepository.existsByNumeroCarte(request.getNumeroCarte())) {
            throw new IllegalArgumentException(
                    "Une carte avec ce numéro existe déjà."
            );
        }

        Expatrie expatrie = resoudreBeneficiaires(request);
        MembreFamille membreFamille = null;

        if (request.getMembreFamilleId() != null) {
            membreFamille = membreFamilleRepository.findById(request.getMembreFamilleId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Membre de famille introuvable avec l'id : " + request.getMembreFamilleId()
                    ));
        }

        carte.setNumeroCarte(request.getNumeroCarte());
        carte.setDateDelivrance(request.getDateDelivrance());
        carte.setDateExpiration(request.getDateExpiration());
        carte.setStatut(calculerStatut(request.getDateExpiration()));
        carte.setExpatrie(expatrie);
        carte.setMembreFamille(membreFamille);

        CarteDiplomatique sauvegarde = carteRepository.save(carte);

        return versResponse(sauvegarde);
    }

    @Transactional
    public void supprimer(Long id) {
        if (!carteRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Carte introuvable avec l'id : " + id
            );
        }

        List<Renouvellement> renouvellementsLies = renouvellementRepository.findByCarteGenereeId(id);
        for (Renouvellement renouvellement : renouvellementsLies) {
            renouvellement.setCarteGeneree(null);
        }
        renouvellementRepository.saveAll(renouvellementsLies);

        carteRepository.deleteById(id);
    }

    private Expatrie resoudreBeneficiaires(CarteDiplomatiqueRequest request) {

        if (request.getExpatrieId() == null && request.getMembreFamilleId() == null) {
            throw new IllegalArgumentException(
                    "La carte doit être associée à un expatrié ou à un membre de famille."
            );
        }

        if (request.getExpatrieId() != null && request.getMembreFamilleId() != null) {
            throw new IllegalArgumentException(
                    "La carte ne peut pas être associée à la fois à un expatrié et à un membre de famille."
            );
        }

        if (request.getExpatrieId() == null) {
            return null;
        }

        return expatrieRepository.findById(request.getExpatrieId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Expatrié introuvable avec l'id : " + request.getExpatrieId()
                ));
    }

    private StatutCarte calculerStatut(LocalDate dateExpiration) {

        LocalDate aujourdHui = LocalDate.now();
        int seuil = parametresRepository.findById(1L)
                .map(Parametres::getSeuilAlerteJours)
                .orElse(SEUIL_PAR_DEFAUT_JOURS);

        if (dateExpiration.isBefore(aujourdHui)) {
            return StatutCarte.EXPIREE;
        }

        if (!dateExpiration.isAfter(aujourdHui.plusDays(seuil))) {
            return StatutCarte.A_RENOUVELER;
        }

        return StatutCarte.VALIDE;
    }

    private CarteDiplomatiqueResponse versResponse(CarteDiplomatique carte) {

        CarteDiplomatiqueResponse.CarteDiplomatiqueResponseBuilder builder =
                CarteDiplomatiqueResponse.builder()
                        .id(carte.getId())
                        .numeroCarte(carte.getNumeroCarte())
                        .dateDelivrance(carte.getDateDelivrance())
                        .dateExpiration(carte.getDateExpiration())
                        .statut(carte.getStatut());

        if (carte.getExpatrie() != null) {
            builder.expatrieId(carte.getExpatrie().getId())
                    .expatrieNomComplet(
                            carte.getExpatrie().getPrenom() + " " + carte.getExpatrie().getNom()
                    );
        }

        if (carte.getMembreFamille() != null) {
            builder.membreFamilleId(carte.getMembreFamille().getId())
                    .membreFamilleNomComplet(
                            carte.getMembreFamille().getPrenom() + " " + carte.getMembreFamille().getNom()
                    );
        }

        return builder.build();
    }
}
