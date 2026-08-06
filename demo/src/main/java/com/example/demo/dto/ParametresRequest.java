package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParametresRequest {

    @NotNull(message = "Le seuil d'alerte est obligatoire")
    @Min(value = 1, message = "Le seuil d'alerte doit être d'au moins 1 jour")
    private Integer seuilAlerteJours;

    private boolean notificationsEmailActivees;

    private boolean notificationsSmsActivees;

    private String emailNotification;

    private String telephoneNotification;
}
