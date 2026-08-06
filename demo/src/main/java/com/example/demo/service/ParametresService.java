package com.example.demo.service;

import com.example.demo.dto.ParametresRequest;
import com.example.demo.dto.ParametresResponse;
import com.example.demo.entity.Parametres;
import com.example.demo.repository.ParametresRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ParametresService {

    private static final long ID_SINGLETON = 1L;
    private static final int SEUIL_PAR_DEFAUT = 30;

    private final ParametresRepository parametresRepository;

    public ParametresService(ParametresRepository parametresRepository) {
        this.parametresRepository = parametresRepository;
    }

    public ParametresResponse obtenir() {
        return versResponse(obtenirOuCreer());
    }

    public ParametresResponse modifier(ParametresRequest request) {

        Parametres parametres = obtenirOuCreer();

        parametres.setSeuilAlerteJours(request.getSeuilAlerteJours());
        parametres.setNotificationsEmailActivees(request.isNotificationsEmailActivees());
        parametres.setNotificationsSmsActivees(request.isNotificationsSmsActivees());
        parametres.setEmailNotification(request.getEmailNotification());
        parametres.setTelephoneNotification(request.getTelephoneNotification());
        parametres.setDateModification(LocalDateTime.now());

        return versResponse(parametresRepository.save(parametres));
    }

    private Parametres obtenirOuCreer() {
        return parametresRepository.findById(ID_SINGLETON)
                .orElseGet(() -> parametresRepository.save(
                        Parametres.builder()
                                .id(ID_SINGLETON)
                                .seuilAlerteJours(SEUIL_PAR_DEFAUT)
                                .notificationsEmailActivees(false)
                                .notificationsSmsActivees(false)
                                .dateModification(LocalDateTime.now())
                                .build()
                ));
    }

    private ParametresResponse versResponse(Parametres parametres) {
        return ParametresResponse.builder()
                .seuilAlerteJours(parametres.getSeuilAlerteJours())
                .notificationsEmailActivees(parametres.isNotificationsEmailActivees())
                .notificationsSmsActivees(parametres.isNotificationsSmsActivees())
                .emailNotification(parametres.getEmailNotification())
                .telephoneNotification(parametres.getTelephoneNotification())
                .dateModification(parametres.getDateModification())
                .build();
    }
}
