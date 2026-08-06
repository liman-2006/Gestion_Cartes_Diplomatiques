package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "parametres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parametres {

    @Id
    private Long id;

    @Column(nullable = false)
    private int seuilAlerteJours;

    @Column(nullable = false)
    private boolean notificationsEmailActivees;

    @Column(nullable = false)
    private boolean notificationsSmsActivees;

    private String emailNotification;

    private String telephoneNotification;

    private LocalDateTime dateModification;
}
