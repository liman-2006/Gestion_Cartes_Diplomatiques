package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.MembreFamilleRequest;
import com.example.demo.dto.MembreFamilleResponse;
import com.example.demo.entity.Expatrie;
import com.example.demo.entity.MembreFamille;
import com.example.demo.repository.ExpatrieRepository;
import com.example.demo.repository.MembreFamilleRepository;

@Service
public class MembreFamilleService {

    private final MembreFamilleRepository membreFamilleRepository;
    private final ExpatrieRepository expatrieRepository;

    public MembreFamilleService(
            MembreFamilleRepository membreFamilleRepository,
            ExpatrieRepository expatrieRepository
    ) {
        this.membreFamilleRepository = membreFamilleRepository;
        this.expatrieRepository = expatrieRepository;
    }

    public MembreFamilleResponse creer(MembreFamilleRequest request) {

        Expatrie expatrie = expatrieRepository.findById(request.getExpatrieId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Expatrié introuvable avec l'id : " + request.getExpatrieId()
                ));

        MembreFamille membre = MembreFamille.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .lienParente(request.getLienParente())
                .dateNaissance(request.getDateNaissance())
                .expatrie(expatrie)
                .build();

        MembreFamille sauvegarde = membreFamilleRepository.save(membre);

        return versResponse(sauvegarde);
    }

    public List<MembreFamilleResponse> listerTous() {
        return membreFamilleRepository.findAll()
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public List<MembreFamilleResponse> listerParExpatrie(Long expatrieId) {
        return membreFamilleRepository.findByExpatrieId(expatrieId)
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public MembreFamilleResponse trouverParId(Long id) {
        MembreFamille membre = membreFamilleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Membre de famille introuvable avec l'id : " + id
                ));
        return versResponse(membre);
    }

    public MembreFamilleResponse modifier(Long id, MembreFamilleRequest request) {

        MembreFamille membre = membreFamilleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Membre de famille introuvable avec l'id : " + id
                ));

        membre.setNom(request.getNom());
        membre.setPrenom(request.getPrenom());
        membre.setLienParente(request.getLienParente());
        membre.setDateNaissance(request.getDateNaissance());

        MembreFamille sauvegarde = membreFamilleRepository.save(membre);

        return versResponse(sauvegarde);
    }

    public void supprimer(Long id) {
        if (!membreFamilleRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Membre de famille introuvable avec l'id : " + id
            );
        }
        membreFamilleRepository.deleteById(id);
    }

    private MembreFamilleResponse versResponse(MembreFamille membre) {
        return MembreFamilleResponse.builder()
                .id(membre.getId())
                .nom(membre.getNom())
                .prenom(membre.getPrenom())
                .lienParente(membre.getLienParente())
                .dateNaissance(membre.getDateNaissance())
                .expatrieId(membre.getExpatrie().getId())
                .expatrieNomComplet(
                        membre.getExpatrie().getPrenom() + " " + membre.getExpatrie().getNom()
                )
                .build();
    }
}