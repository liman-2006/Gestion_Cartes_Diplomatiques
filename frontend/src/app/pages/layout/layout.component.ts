import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { CarteService } from '../../core/carte.service';
import { RenouvellementService } from '../../core/renouvellement.service';
import { ThemeService } from '../../core/theme.service';

interface Notification {
  titre: string;
  sousTitre: string;
  date: string;
  classeBadge: string;
  libelleBadge: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  readonly nombreCartesAlerte = signal(0);
  readonly notificationsOuvertes = signal(false);
  readonly notifications = signal<Notification[]>([]);
  readonly chargementNotifications = signal(true);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private carteService: CarteService,
    private renouvellementService: RenouvellementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    forkJoin({
      cartes: this.carteService.listerTous(),
      renouvellements: this.renouvellementService.listerTous()
    }).subscribe({
      next: ({ cartes, renouvellements }) => {

        const total = cartes.filter(c => c.statut === 'A_RENOUVELER' || c.statut === 'EXPIREE').length;
        this.nombreCartesAlerte.set(total);

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

        this.notifications.set(
          [...notificationsCartes, ...notificationsRenouvellements].sort((a, b) => a.date.localeCompare(b.date))
        );
        this.chargementNotifications.set(false);
      },
      error: () => {
        this.nombreCartesAlerte.set(0);
        this.chargementNotifications.set(false);
      }
    });
  }

  basculerNotifications(evenement: Event): void {
    evenement.stopPropagation();
    this.notificationsOuvertes.update(valeur => !valeur);
  }

  @HostListener('document:click')
  fermerNotifications(): void {
    this.notificationsOuvertes.set(false);
  }

  libelleRole(): string {
    return this.authService.currentUserRole() === 'RESPONSABLE'
      ? 'Responsable logistique'
      : 'Agent';
  }

  initialesUtilisateur(): string {
    const email = this.authService.currentUserEmail();

    if (!email) {
      return '?';
    }

    return email.substring(0, 2).toUpperCase();
  }

  seDeconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }
}
