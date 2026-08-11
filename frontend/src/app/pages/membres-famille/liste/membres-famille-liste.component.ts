import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MembreFamilleService } from '../../../core/membre-famille.service';
import { CarteService } from '../../../core/carte.service';
import { AuthService } from '../../../core/auth.service';
import { MembreFamille } from '../../../models/membre-famille.model';

interface MembreAffichage extends MembreFamille {
  numeroCarte: string | null;
  dateExpirationCarte: string | null;
  statutCarte: string | null;
  initiales: string;
}

@Component({
  selector: 'app-membres-famille-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './membres-famille-liste.component.html'
})
export class MembresFamilleListeComponent implements OnInit {

  membres: MembreAffichage[] = [];
  membresFiltres: MembreAffichage[] = [];
  chargement = true;
  messageErreur: string | null = null;
  termeRecherche = '';

  constructor(
    private membreFamilleService: MembreFamilleService,
    private carteService: CarteService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    forkJoin({
      membres: this.membreFamilleService.listerTous(),
      cartes: this.carteService.listerTous()
    }).subscribe({
      next: ({ membres, cartes }) => {
        this.membres = membres.map(membre => {
          const carte = cartes.find(c => c.membreFamilleId === membre.id);

          return {
            ...membre,
            numeroCarte: carte?.numeroCarte ?? null,
            dateExpirationCarte: carte?.dateExpiration ?? null,
            statutCarte: carte?.statut ?? null,
            initiales: this.calculerInitiales(membre.prenom, membre.nom)
          };
        });
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les membres de famille.";
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const terme = this.termeRecherche.trim().toLowerCase();

    if (!terme) {
      this.membresFiltres = this.membres;
      return;
    }

    this.membresFiltres = this.membres.filter(membre =>
      `${membre.prenom} ${membre.nom}`.toLowerCase().includes(terme) ||
      membre.expatrieNomComplet.toLowerCase().includes(terme) ||
      (membre.lienParente ?? '').toLowerCase().includes(terme)
    );
  }

  private calculerInitiales(prenom: string, nom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  classeBadgeStatut(statut: string | null): string {
    switch (statut) {
      case 'VALIDE':
        return 'badge-active';
      case 'A_RENOUVELER':
        return 'badge-expire-bientot';
      case 'EXPIREE':
        return 'badge-expiree';
      default:
        return 'badge-inactif';
    }
  }

  libelleStatut(statut: string | null): string {
    switch (statut) {
      case 'VALIDE':
        return 'Valide';
      case 'A_RENOUVELER':
        return 'À renouveler';
      case 'EXPIREE':
        return 'Expirée';
      default:
        return 'Aucune carte';
    }
  }

  supprimer(membre: MembreFamille): void {

    const confirmation = confirm(
      `Supprimer le membre de famille ${membre.prenom} ${membre.nom} ?`
    );

    if (!confirmation) {
      return;
    }

    this.membreFamilleService.supprimer(membre.id).subscribe({
      next: () => this.charger(),
      error: () => {
        this.messageErreur = "Suppression impossible.";
      }
    });
  }
}
