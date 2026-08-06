package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ParametresResponse {

    private int seuilAlerteJours;
    private boolean notificationsEmailActivees;
    private boolean notificationsSmsActivees;
    private String emailNotification;
    private String telephoneNotification;
    private LocalDateTime dateModification;
}
