package com.example.demo.service;

import com.example.demo.dto.CarteDiplomatiqueResponse;
import com.example.demo.enums.StatutCarte;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RapportService {

    private static final String[] EN_TETES = {
            "Numéro", "Bénéficiaire", "Type", "Délivrance", "Expiration", "Statut"
    };

    private final CarteDiplomatiqueService carteDiplomatiqueService;

    public RapportService(CarteDiplomatiqueService carteDiplomatiqueService) {
        this.carteDiplomatiqueService = carteDiplomatiqueService;
    }

    public byte[] genererExcel(String statut, String typeBeneficiaire, LocalDate dateDebut, LocalDate dateFin) {

        List<CarteDiplomatiqueResponse> cartes =
                filtrer(carteDiplomatiqueService.listerTous(), statut, typeBeneficiaire, dateDebut, dateFin);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {

            Sheet feuille = workbook.createSheet("Cartes diplomatiques");

            Row ligneEntete = feuille.createRow(0);
            for (int i = 0; i < EN_TETES.length; i++) {
                ligneEntete.createCell(i).setCellValue(EN_TETES[i]);
            }

            int numeroLigne = 1;
            for (CarteDiplomatiqueResponse carte : cartes) {
                Row ligne = feuille.createRow(numeroLigne++);
                remplirLigne(ligne, carte);
            }

            for (int i = 0; i < EN_TETES.length; i++) {
                feuille.autoSizeColumn(i);
            }

            ByteArrayOutputStream sortie = new ByteArrayOutputStream();
            workbook.write(sortie);
            return sortie.toByteArray();

        } catch (IOException e) {
            throw new IllegalStateException("Impossible de générer le fichier Excel.", e);
        }
    }

    private void remplirLigne(Row ligne, CarteDiplomatiqueResponse carte) {
        Cell c0 = ligne.createCell(0);
        c0.setCellValue(carte.getNumeroCarte());

        Cell c1 = ligne.createCell(1);
        c1.setCellValue(beneficiaire(carte));

        Cell c2 = ligne.createCell(2);
        c2.setCellValue(carte.getExpatrieId() != null ? "Employé" : "Famille");

        Cell c3 = ligne.createCell(3);
        c3.setCellValue(carte.getDateDelivrance().toString());

        Cell c4 = ligne.createCell(4);
        c4.setCellValue(carte.getDateExpiration().toString());

        Cell c5 = ligne.createCell(5);
        c5.setCellValue(carte.getStatut().name());
    }

    public byte[] genererPdf(String statut, String typeBeneficiaire, LocalDate dateDebut, LocalDate dateFin) {

        List<CarteDiplomatiqueResponse> cartes =
                filtrer(carteDiplomatiqueService.listerTous(), statut, typeBeneficiaire, dateDebut, dateFin);

        try (ByteArrayOutputStream sortie = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, sortie);
            document.open();

            Paragraph titre = new Paragraph(
                    "Inventaire des cartes diplomatiques",
                    new Font(Font.HELVETICA, 16, Font.BOLD)
            );
            titre.setAlignment(Element.ALIGN_CENTER);
            document.add(titre);

            Paragraph genere = new Paragraph(
                    "Généré le " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    new Font(Font.HELVETICA, 9, Font.ITALIC)
            );
            genere.setAlignment(Element.ALIGN_CENTER);
            genere.setSpacingAfter(15f);
            document.add(genere);

            PdfPTable table = new PdfPTable(EN_TETES.length);
            table.setWidthPercentage(100);

            for (String entete : EN_TETES) {
                PdfPCell cellule = new PdfPCell(new Paragraph(entete, new Font(Font.HELVETICA, 10, Font.BOLD)));
                table.addCell(cellule);
            }

            for (CarteDiplomatiqueResponse carte : cartes) {
                table.addCell(carte.getNumeroCarte());
                table.addCell(beneficiaire(carte));
                table.addCell(carte.getExpatrieId() != null ? "Employé" : "Famille");
                table.addCell(carte.getDateDelivrance().toString());
                table.addCell(carte.getDateExpiration().toString());
                table.addCell(carte.getStatut().name());
            }

            document.add(table);
            document.close();

            return sortie.toByteArray();

        } catch (Exception e) {
            throw new IllegalStateException("Impossible de générer le fichier PDF.", e);
        }
    }

    private String beneficiaire(CarteDiplomatiqueResponse carte) {
        if (carte.getExpatrieNomComplet() != null) {
            return carte.getExpatrieNomComplet();
        }
        if (carte.getMembreFamilleNomComplet() != null) {
            return carte.getMembreFamilleNomComplet();
        }
        return "—";
    }

    private List<CarteDiplomatiqueResponse> filtrer(
            List<CarteDiplomatiqueResponse> cartes,
            String statut,
            String typeBeneficiaire,
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
        return cartes.stream()
                .filter(carte -> statut == null || statut.isBlank()
                        || carte.getStatut() == StatutCarte.valueOf(statut))
                .filter(carte -> typeBeneficiaire == null || typeBeneficiaire.isBlank()
                        || ("EXPATRIE".equals(typeBeneficiaire) && carte.getExpatrieId() != null)
                        || ("MEMBRE".equals(typeBeneficiaire) && carte.getMembreFamilleId() != null))
                .filter(carte -> dateDebut == null || !carte.getDateDelivrance().isBefore(dateDebut))
                .filter(carte -> dateFin == null || !carte.getDateDelivrance().isAfter(dateFin))
                .toList();
    }
}
