package com.example.demo.service;

import com.example.demo.dto.CarteDiplomatiqueResponse;
import com.example.demo.entity.CarteDiplomatique;
import com.example.demo.entity.Parametres;
import com.example.demo.enums.StatutCarte;
import com.example.demo.repository.CarteDiplomatiqueRepository;
import com.example.demo.repository.ParametresRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class StatutCarteSchedulerService {

    private static final int SEUIL_PAR_DEFAUT_JOURS = 30;
    private static final int[] ECHEANCES_ALERTE_JOURS = { 90, 60, 30 };

    private final CarteDiplomatiqueRepository carteRepository;
    private final ParametresRepository parametresRepository;
    private final CarteDiplomatiqueService carteDiplomatiqueService;
    private final EmailNotificationService emailNotificationService;

    public StatutCarteSchedulerService(
            CarteDiplomatiqueRepository carteRepository,
            ParametresRepository parametresRepository,
            CarteDiplomatiqueService carteDiplomatiqueService,
            EmailNotificationService emailNotificationService
    ) {
        this.carteRepository = carteRepository;
        this.parametresRepository = parametresRepository;
        this.carteDiplomatiqueService = carteDiplomatiqueService;
        this.emailNotificationService = emailNotificationService;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void recalculerStatutsNocturne() {
        recalculerEtAppliquer();
    }

    @Scheduled(cron = "0 0 7 1 * ?")
    public void envoyerRecapMensuel() {

        Parametres parametres = parametresRepository.findById(1L).orElse(null);

        if (parametres == null || !parametres.isNotificationsEmailActivees()) {
            return;
        }

        emailNotificationService.envoyerRecapMensuel(parametres, carteDiplomatiqueService.listerTous());
    }

    public int recalculerEtAppliquer() {

        LocalDate aujourdHui = LocalDate.now();
        int seuil = parametresRepository.findById(1L)
                .map(Parametres::getSeuilAlerteJours)
                .orElse(SEUIL_PAR_DEFAUT_JOURS);

        List<CarteDiplomatique> cartes = carteRepository.findAll();
        List<CarteDiplomatique> modifiees = cartes.stream()
                .filter(carte -> {
                    StatutCarte nouveauStatut = calculerStatut(carte.getDateExpiration(), aujourdHui, seuil);
                    if (nouveauStatut != carte.getStatut()) {
                        carte.setStatut(nouveauStatut);
                        return true;
                    }
                    return false;
                })
                .toList();

        carteRepository.saveAll(modifiees);

        envoyerAlertesEcheance(aujourdHui);

        return modifiees.size();
    }

    private void envoyerAlertesEcheance(LocalDate aujourdHui) {

        Parametres parametres = parametresRepository.findById(1L).orElse(null);

        if (parametres == null || !parametres.isNotificationsEmailActivees()) {
            return;
        }

        List<CarteDiplomatiqueResponse> toutesLesCartes = carteDiplomatiqueService.listerTous();

        List<CarteDiplomatiqueResponse> a90Jours = cartesAEcheance(toutesLesCartes, aujourdHui, ECHEANCES_ALERTE_JOURS[0]);
        List<CarteDiplomatiqueResponse> a60Jours = cartesAEcheance(toutesLesCartes, aujourdHui, ECHEANCES_ALERTE_JOURS[1]);
        List<CarteDiplomatiqueResponse> a30Jours = cartesAEcheance(toutesLesCartes, aujourdHui, ECHEANCES_ALERTE_JOURS[2]);

        emailNotificationService.envoyerAlertesEcheance(parametres, a90Jours, a60Jours, a30Jours);
    }

    private List<CarteDiplomatiqueResponse> cartesAEcheance(
            List<CarteDiplomatiqueResponse> cartes,
            LocalDate aujourdHui,
            int joursCible
    ) {
        return cartes.stream()
                .filter(carte -> ChronoUnit.DAYS.between(aujourdHui, carte.getDateExpiration()) == joursCible)
                .toList();
    }

    private StatutCarte calculerStatut(LocalDate dateExpiration, LocalDate aujourdHui, int seuil) {

        if (dateExpiration.isBefore(aujourdHui)) {
            return StatutCarte.EXPIREE;
        }

        if (!dateExpiration.isAfter(aujourdHui.plusDays(seuil))) {
            return StatutCarte.A_RENOUVELER;
        }

        return StatutCarte.VALIDE;
    }
}
