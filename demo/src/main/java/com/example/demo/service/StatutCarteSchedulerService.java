package com.example.demo.service;

import com.example.demo.entity.CarteDiplomatique;
import com.example.demo.entity.Parametres;
import com.example.demo.enums.StatutCarte;
import com.example.demo.repository.CarteDiplomatiqueRepository;
import com.example.demo.repository.ParametresRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class StatutCarteSchedulerService {

    private static final int SEUIL_PAR_DEFAUT_JOURS = 30;

    private final CarteDiplomatiqueRepository carteRepository;
    private final ParametresRepository parametresRepository;

    public StatutCarteSchedulerService(
            CarteDiplomatiqueRepository carteRepository,
            ParametresRepository parametresRepository
    ) {
        this.carteRepository = carteRepository;
        this.parametresRepository = parametresRepository;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void recalculerStatutsNocturne() {
        recalculerEtAppliquer();
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

        return modifiees.size();
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
