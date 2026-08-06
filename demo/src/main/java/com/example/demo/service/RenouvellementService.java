package com.example.demo.service;

import com.example.demo.dto.DocumentRenouvellementRequest;
import com.example.demo.dto.DocumentRenouvellementResponse;
import com.example.demo.dto.RenouvellementRequest;
import com.example.demo.dto.RenouvellementResponse;
import com.example.demo.entity.DocumentRenouvellement;
import com.example.demo.entity.Expatrie;
import com.example.demo.entity.Renouvellement;
import com.example.demo.enums.StatutRenouvellement;
import com.example.demo.repository.DocumentRenouvellementRepository;
import com.example.demo.repository.ExpatrieRepository;
import com.example.demo.repository.RenouvellementRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RenouvellementService {

    private final RenouvellementRepository renouvellementRepository;
    private final ExpatrieRepository expatrieRepository;
    private final DocumentRenouvellementRepository documentRepository;

    public RenouvellementService(
            RenouvellementRepository renouvellementRepository,
            ExpatrieRepository expatrieRepository,
            DocumentRenouvellementRepository documentRepository
    ) {
        this.renouvellementRepository = renouvellementRepository;
        this.expatrieRepository = expatrieRepository;
        this.documentRepository = documentRepository;
    }

    public RenouvellementResponse creer(RenouvellementRequest request) {

        Expatrie expatrie = expatrieRepository.findById(request.getExpatrieId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Expatrié introuvable avec l'id : " + request.getExpatrieId()
                ));

        Renouvellement renouvellement = Renouvellement.builder()
                .expatrie(expatrie)
                .typeRenouvellement(request.getTypeRenouvellement())
                .dateProgrammee(request.getDateProgrammee())
                .statut(StatutRenouvellement.PROGRAMME)
                .notes(request.getNotes())
                .build();

        Renouvellement sauvegarde = renouvellementRepository.save(renouvellement);

        return versResponse(sauvegarde);
    }

    public List<RenouvellementResponse> listerTous() {
        return renouvellementRepository.findAll()
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public List<RenouvellementResponse> listerParExpatrie(Long expatrieId) {
        return renouvellementRepository.findByExpatrieId(expatrieId)
                .stream()
                .map(this::versResponse)
                .toList();
    }

    public RenouvellementResponse trouverParId(Long id) {
        return versResponse(trouverEntiteParId(id));
    }

    public RenouvellementResponse modifier(Long id, RenouvellementRequest request) {

        Renouvellement renouvellement = trouverEntiteParId(id);

        Expatrie expatrie = expatrieRepository.findById(request.getExpatrieId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Expatrié introuvable avec l'id : " + request.getExpatrieId()
                ));

        renouvellement.setExpatrie(expatrie);
        renouvellement.setTypeRenouvellement(request.getTypeRenouvellement());
        renouvellement.setDateProgrammee(request.getDateProgrammee());
        renouvellement.setNotes(request.getNotes());

        Renouvellement sauvegarde = renouvellementRepository.save(renouvellement);

        return versResponse(sauvegarde);
    }

    public void supprimer(Long id) {
        if (!renouvellementRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Renouvellement introuvable avec l'id : " + id
            );
        }
        renouvellementRepository.deleteById(id);
    }

    public RenouvellementResponse ajouterDocument(Long renouvellementId, DocumentRenouvellementRequest request) {

        Renouvellement renouvellement = trouverEntiteParId(renouvellementId);

        DocumentRenouvellement document = DocumentRenouvellement.builder()
                .renouvellement(renouvellement)
                .nomDocument(request.getNomDocument())
                .recu(false)
                .build();

        documentRepository.save(document);

        return versResponse(recalculerEtSauvegarder(renouvellement));
    }

    public RenouvellementResponse basculerDocumentRecu(Long documentId) {

        DocumentRenouvellement document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Document introuvable avec l'id : " + documentId
                ));

        document.setRecu(!document.isRecu());
        documentRepository.save(document);

        return versResponse(recalculerEtSauvegarder(document.getRenouvellement()));
    }

    public RenouvellementResponse supprimerDocument(Long documentId) {

        DocumentRenouvellement document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Document introuvable avec l'id : " + documentId
                ));

        Renouvellement renouvellement = document.getRenouvellement();
        documentRepository.deleteById(documentId);

        return versResponse(recalculerEtSauvegarder(trouverEntiteParId(renouvellement.getId())));
    }

    private Renouvellement trouverEntiteParId(Long id) {
        return renouvellementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Renouvellement introuvable avec l'id : " + id
                ));
    }

    private Renouvellement recalculerEtSauvegarder(Renouvellement renouvellement) {

        List<DocumentRenouvellement> documents = documentRepository.findByRenouvellementId(renouvellement.getId());

        StatutRenouvellement nouveauStatut;
        if (documents.isEmpty()) {
            nouveauStatut = StatutRenouvellement.PROGRAMME;
        } else if (documents.stream().allMatch(DocumentRenouvellement::isRecu)) {
            nouveauStatut = StatutRenouvellement.COMPLETE;
        } else if (documents.stream().anyMatch(DocumentRenouvellement::isRecu)) {
            nouveauStatut = StatutRenouvellement.EN_COURS;
        } else {
            nouveauStatut = StatutRenouvellement.PROGRAMME;
        }

        renouvellement.setStatut(nouveauStatut);
        return renouvellementRepository.save(renouvellement);
    }

    private RenouvellementResponse versResponse(Renouvellement renouvellement) {

        List<DocumentRenouvellement> documents = documentRepository.findByRenouvellementId(renouvellement.getId());

        List<DocumentRenouvellementResponse> documentsResponse = documents.stream()
                .map(doc -> DocumentRenouvellementResponse.builder()
                        .id(doc.getId())
                        .renouvellementId(renouvellement.getId())
                        .nomDocument(doc.getNomDocument())
                        .recu(doc.isRecu())
                        .build())
                .toList();

        RenouvellementResponse.RenouvellementResponseBuilder builder = RenouvellementResponse.builder()
                .id(renouvellement.getId())
                .expatrieId(renouvellement.getExpatrie().getId())
                .expatrieNomComplet(
                        renouvellement.getExpatrie().getPrenom() + " " + renouvellement.getExpatrie().getNom()
                )
                .typeRenouvellement(renouvellement.getTypeRenouvellement())
                .dateProgrammee(renouvellement.getDateProgrammee())
                .statut(renouvellement.getStatut())
                .notes(renouvellement.getNotes())
                .documents(documentsResponse);

        if (renouvellement.getCarteGeneree() != null) {
            builder.carteGenereeId(renouvellement.getCarteGeneree().getId())
                    .carteGenereeNumero(renouvellement.getCarteGeneree().getNumeroCarte());
        }

        return builder.build();
    }
}
