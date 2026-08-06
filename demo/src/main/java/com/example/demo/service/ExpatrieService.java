package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ExpatrieRequest;
import com.example.demo.dto.ExpatrieResponse;
import com.example.demo.entity.Expatrie;
import com.example.demo.repository.ExpatrieRepository;

@Service
public class ExpatrieService {

    private final ExpatrieRepository expatrieRepository;

    public ExpatrieService(ExpatrieRepository expatrieRepository) {
        this.expatrieRepository = expatrieRepository;
    }

    public ExpatrieResponse creer(ExpatrieRequest request) {

        if (expatrieRepository.existsByMatricule(request.getMatricule())) {
            throw new IllegalArgumentException(
                    "Un expatrié avec ce matricule existe déjà."
            );
        }

        Expatrie expatrie = Expatrie.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .matricule(request.getMatricule())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .dateArrivee(request.getDateArrivee())
                .actif(true)
                .build();

        Expatrie sauvegarde = expatrieRepository.save(expatrie);

        return versResponse(sauvegarde);
    }

    public List<ExpatrieResponse> listerTous() {
        return expatrieRepository.findAll()
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public ExpatrieResponse trouverParId(Long id) {
        Expatrie expatrie = expatrieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Expatrié introuvable avec l'id : " + id
                ));
        return versResponse(expatrie);
    }

    public ExpatrieResponse modifier(Long id, ExpatrieRequest request) {

        Expatrie expatrie = expatrieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Expatrié introuvable avec l'id : " + id
                ));

        expatrie.setNom(request.getNom());
        expatrie.setPrenom(request.getPrenom());
        expatrie.setEmail(request.getEmail());
        expatrie.setTelephone(request.getTelephone());
        expatrie.setDateArrivee(request.getDateArrivee());

        Expatrie sauvegarde = expatrieRepository.save(expatrie);

        return versResponse(sauvegarde);
    }

    public void supprimer(Long id) {
        if (!expatrieRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Expatrié introuvable avec l'id : " + id
            );
        }
        expatrieRepository.deleteById(id);
    }

    private ExpatrieResponse versResponse(Expatrie expatrie) {
        return ExpatrieResponse.builder()
                .id(expatrie.getId())
                .nom(expatrie.getNom())
                .prenom(expatrie.getPrenom())
                .matricule(expatrie.getMatricule())
                .email(expatrie.getEmail())
                .telephone(expatrie.getTelephone())
                .dateArrivee(expatrie.getDateArrivee())
                .actif(expatrie.isActif())
                .build();
    }
}