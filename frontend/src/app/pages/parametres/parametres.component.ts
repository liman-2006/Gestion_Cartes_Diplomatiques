import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ParametresService } from '../../core/parametres.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parametres.component.html'
})
export class ParametresComponent implements OnInit {

  private fb = inject(FormBuilder);
  private parametresService = inject(ParametresService);

  chargement = false;
  messageErreur: string | null = null;
  messageSucces: string | null = null;

  formulaire = this.fb.group({
    seuilAlerteJours: [30, [Validators.required, Validators.min(1)]],
    notificationsEmailActivees: [false],
    notificationsSmsActivees: [false],
    emailNotification: [''],
    telephoneNotification: ['']
  });

  ngOnInit(): void {
    this.parametresService.obtenir().subscribe({
      next: (parametres) => {
        this.formulaire.patchValue({
          seuilAlerteJours: parametres.seuilAlerteJours,
          notificationsEmailActivees: parametres.notificationsEmailActivees,
          notificationsSmsActivees: parametres.notificationsSmsActivees,
          emailNotification: parametres.emailNotification ?? '',
          telephoneNotification: parametres.telephoneNotification ?? ''
        });
      },
      error: () => {
        this.messageErreur = "Impossible de charger les paramètres.";
      }
    });
  }

  soumettre(): void {

    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    const valeurs = this.formulaire.getRawValue();

    this.chargement = true;
    this.messageErreur = null;
    this.messageSucces = null;

    this.parametresService.modifier({
      seuilAlerteJours: valeurs.seuilAlerteJours!,
      notificationsEmailActivees: valeurs.notificationsEmailActivees!,
      notificationsSmsActivees: valeurs.notificationsSmsActivees!,
      emailNotification: valeurs.emailNotification || null,
      telephoneNotification: valeurs.telephoneNotification || null
    }).subscribe({
      next: () => {
        this.chargement = false;
        this.messageSucces = "Paramètres enregistrés.";
      },
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err?.error?.message ?? "Une erreur est survenue.";
      }
    });
  }
}
