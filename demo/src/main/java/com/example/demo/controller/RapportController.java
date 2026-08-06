package com.example.demo.controller;

import com.example.demo.service.RapportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rapports")
public class RapportController {

    private final RapportService rapportService;

    public RapportController(RapportService rapportService) {
        this.rapportService = rapportService;
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exporterExcel() {

        byte[] fichier = rapportService.genererExcel();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cartes-diplomatiques.xlsx")
                .body(fichier);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exporterPdf() {

        byte[] fichier = rapportService.genererPdf();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cartes-diplomatiques.pdf")
                .body(fichier);
    }
}
