package com.example.demo.controller;

import com.example.demo.service.RapportService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/rapports")
public class RapportController {

    private final RapportService rapportService;

    public RapportController(RapportService rapportService) {
        this.rapportService = rapportService;
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exporterExcel(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin
    ) {

        byte[] fichier = rapportService.genererExcel(statut, type, dateDebut, dateFin);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cartes-diplomatiques.xlsx")
                .body(fichier);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exporterPdf(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin
    ) {

        byte[] fichier = rapportService.genererPdf(statut, type, dateDebut, dateFin);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cartes-diplomatiques.pdf")
                .body(fichier);
    }
}
