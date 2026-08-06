import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { CarteService } from '../../core/carte.service';
import { RenouvellementService } from '../../core/renouvellement.service';

interface Notification {
  titre: string;
  sousTitre: string;
  date: string;
  classeBadge: string;
  libelleBadge: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {

  chargement = true;
  messageErreur: string | null = null;
  notifications: Notification[] = [];

  constructor(
    private carteService: CarteService,
    private renouvellementService: RenouvellementService
  ) {}

  ngOnInit(): void {
    forkJoin({
      cartes: this.carteService.listerTous(),
      renouvellements: this.renouvellementService.listerTous()
    }).subscribe({
      next: ({ cartes, renouvellements }) => {

        const notificationsCartes: Notification[] = cartes
          .filter(c => c.statut === 'A_RENOUVELER' || c.statut === 'EXPIREE')
          .map(c => {
            const beneficiaire = c.expatrieNomComplet ?? c.membreFamilleNomComplet ?? '—';
            return c.statut === 'EXPIREE'
              ? {
                  titre: beneficiaire,
                  sousTitre: `La carte ${c.numeroCarte} a expiré le ${c.dateExpiration}`,
                  date: c.dateExpiration,
                  classeBadge: 'badge-expiree',
                  libelleBadge: 'Expirée'
                }
              : {
                  titre: beneficiaire,
                  sousTitre: `La carte ${c.numeroCarte} expire le ${c.dateExpiration}`,
                  date: c.dateExpiration,
                  classeBadge: 'badge-expire-bientot',
                  libelleBadge: 'À renouveler'
                };
          });

        const notificationsRenouvellements: Notification[] = renouvellements
          .filter(r => r.statut === 'COMPLETE' && !r.carteGenereeId)
          .map(r => ({
            titre: r.expatrieNomComplet,
            sousTitre: 'Renouvellement terminé — la nouvelle carte reste à créer',
            date: r.dateProgrammee,
            classeBadge: 'badge-active',
            libelleBadge: 'Prêt à finaliser'
          }));

        this.notifications = [...notificationsCartes, ...notificationsRenouvellements]
          .sort((a, b) => a.date.localeCompare(b.date));

        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les notifications.";
        this.chargement = false;
      }
    });
  }
}
