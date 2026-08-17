package com.example.demo.service;

import com.example.demo.dto.CarteDiplomatiqueResponse;
import com.example.demo.entity.Parametres;
import com.example.demo.enums.StatutCarte;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class EmailNotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(EmailNotificationService.class);
    private static final DateTimeFormatter FORMAT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String expediteur;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoi automatique (planifie chaque nuit) : alerte quand une carte atteint exactement
     * 90, 60 ou 30 jours avant expiration. N'interrompt jamais l'appelant, les erreurs sont journalisees.
     */
    public void envoyerAlertesEcheance(
            Parametres parametres,
            List<CarteDiplomatiqueResponse> cartesA90Jours,
            List<CarteDiplomatiqueResponse> cartesA60Jours,
            List<CarteDiplomatiqueResponse> cartesA30Jours
    ) {

        if (parametres == null || !parametres.isNotificationsEmailActivees()) {
            return;
        }

        String destinataire = parametres.getEmailNotification();
        if (destinataire == null || destinataire.isBlank()) {
            return;
        }

        if (cartesA90Jours.isEmpty() && cartesA60Jours.isEmpty() && cartesA30Jours.isEmpty()) {
            return;
        }

        int total = cartesA90Jours.size() + cartesA60Jours.size() + cartesA30Jours.size();

        StringBuilder corps = new StringBuilder();
        corps.append("Bonjour,\n\n");
        corps.append("Les cartes diplomatiques suivantes approchent de leur date d'expiration. ");
        corps.append("Merci de lancer la procédure de renouvellement.\n\n");
        ajouterSection(corps, "ÉCHÉANCE DANS 90 JOURS", cartesA90Jours);
        ajouterSection(corps, "ÉCHÉANCE DANS 60 JOURS", cartesA60Jours);
        ajouterSection(corps, "ÉCHÉANCE DANS 30 JOURS — ACTION URGENTE", cartesA30Jours);
        corps.append("Cet email est généré automatiquement par l'application de gestion des cartes diplomatiques.\n");

        try {
            mailSender.send(construireMessage(
                    destinataire,
                    "Renouvellement à prévoir : %d carte(s) diplomatique(s)".formatted(total),
                    corps.toString()
            ));
            LOG.info("Email d'alerte d'échéance envoyé à {} (90j:{}, 60j:{}, 30j:{}).",
                    destinataire, cartesA90Jours.size(), cartesA60Jours.size(), cartesA30Jours.size());
        } catch (MailException e) {
            LOG.error("Échec de l'envoi de l'email d'alerte d'échéance à {}.", destinataire, e);
        }
    }

    /**
     * Envoi automatique (planifie le 1er de chaque mois) : recapitulatif complet des statuts.
     */
    public void envoyerRecapMensuel(Parametres parametres, List<CarteDiplomatiqueResponse> toutesLesCartes) {

        if (parametres == null || !parametres.isNotificationsEmailActivees()) {
            return;
        }

        String destinataire = parametres.getEmailNotification();
        if (destinataire == null || destinataire.isBlank()) {
            return;
        }

        List<CarteDiplomatiqueResponse> valides = toutesLesCartes.stream()
                .filter(carte -> carte.getStatut() == StatutCarte.VALIDE)
                .toList();
        List<CarteDiplomatiqueResponse> aRenouveler = toutesLesCartes.stream()
                .filter(carte -> carte.getStatut() == StatutCarte.A_RENOUVELER)
                .toList();
        List<CarteDiplomatiqueResponse> expirees = toutesLesCartes.stream()
                .filter(carte -> carte.getStatut() == StatutCarte.EXPIREE)
                .toList();

        StringBuilder corps = new StringBuilder();
        corps.append("Bonjour,\n\n");
        corps.append("Voici le récapitulatif mensuel du statut des cartes diplomatiques au ")
                .append(LocalDate.now().format(FORMAT_DATE)).append(" :\n\n");
        corps.append("  - Cartes valides : ").append(valides.size()).append("\n");
        corps.append("  - Cartes à renouveler : ").append(aRenouveler.size()).append("\n");
        corps.append("  - Cartes expirées : ").append(expirees.size()).append("\n");
        corps.append("  - Total : ").append(toutesLesCartes.size()).append("\n\n");
        ajouterSection(corps, "CARTES À RENOUVELER", aRenouveler);
        ajouterSection(corps, "CARTES EXPIRÉES", expirees);
        corps.append("Cet email est généré automatiquement par l'application de gestion des cartes diplomatiques.\n");

        String sujet = "Récapitulatif mensuel des cartes diplomatiques - "
                + LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH));

        try {
            mailSender.send(construireMessage(destinataire, sujet, corps.toString()));
            LOG.info("Récapitulatif mensuel envoyé à {} ({} carte(s)).", destinataire, toutesLesCartes.size());
        } catch (MailException e) {
            LOG.error("Échec de l'envoi du récapitulatif mensuel à {}.", destinataire, e);
        }
    }

    /**
     * Envoi manuel depuis la page Paramètres : l'erreur remonte pour être affichée à l'utilisateur.
     */
    public void envoyerEmailTest(String destinataire) {

        if (destinataire == null || destinataire.isBlank()) {
            throw new IllegalArgumentException(
                    "Aucune adresse email de notification n'est configurée dans les paramètres."
            );
        }

        try {
            mailSender.send(construireMessage(
                    destinataire,
                    "Test - Gestion des cartes diplomatiques",
                    "Ceci est un email de test envoyé depuis l'application de gestion des cartes diplomatiques.\n\n"
                            + "Si vous recevez ce message, l'envoi automatique des alertes est correctement configuré."
            ));
            LOG.info("Email de test envoyé à {}.", destinataire);
        } catch (MailException e) {
            LOG.error("Échec de l'envoi de l'email de test à {}.", destinataire, e);
            throw new IllegalArgumentException(
                    "Impossible d'envoyer l'email de test : " + causeRacine(e), e
            );
        }
    }

    private SimpleMailMessage construireMessage(String destinataire, String sujet, String corps) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinataire);
        if (expediteur != null && !expediteur.isBlank()) {
            message.setFrom(expediteur);
        }
        message.setSubject(sujet);
        message.setText(corps);
        return message;
    }

    private void ajouterSection(StringBuilder corps, String titre, List<CarteDiplomatiqueResponse> cartes) {

        if (cartes.isEmpty()) {
            return;
        }

        corps.append(titre).append(" (").append(cartes.size()).append(") :\n");
        cartes.stream()
                .sorted(Comparator.comparing(CarteDiplomatiqueResponse::getDateExpiration))
                .forEach(carte -> corps.append(ligne(carte)));
        corps.append("\n");
    }

    private String ligne(CarteDiplomatiqueResponse carte) {
        String beneficiaire = carte.getExpatrieNomComplet() != null
                ? carte.getExpatrieNomComplet()
                : (carte.getMembreFamilleNomComplet() != null ? carte.getMembreFamilleNomComplet() : "—");

        return "  - %s · %s · expire le %s\n".formatted(
                carte.getNumeroCarte(), beneficiaire, carte.getDateExpiration().format(FORMAT_DATE)
        );
    }

    private String causeRacine(Throwable e) {
        Throwable racine = e;
        while (racine.getCause() != null) {
            racine = racine.getCause();
        }
        return racine.getMessage() != null ? racine.getMessage() : racine.getClass().getSimpleName();
    }
}
