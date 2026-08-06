import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RenouvellementService } from '../../../core/renouvellement.service';
import { AuthService } from '../../../core/auth.service';
import { Renouvellement } from '../../../models/renouvellement.model';

@Component({
  selector: 'app-renouvellements-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './renouvellements-liste.component.html'
})
export class RenouvellementsListeComponent implements OnInit {

  renouvellements: Renouvellement[] = [];
  renouvellementsFiltres: Renouvellement[] = [];
  chargement = true;
  messageErreur: string | null = null;
  termeRecherche = '';

  constructor(
    private renouvellementService: RenouvellementService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.renouvellementService.listerTous().subscribe({
      next: (donnees) => {
        this.renouvellements = donnees;
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les renouvellements.";
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const terme = this.termeRecherche.trim().toLowerCase();

    this.renouvellementsFiltres = !terme
      ? this.renouvellements
      : this.renouvellements.filter(r => r.expatrieNomComplet.toLowerCase().includes(terme));
  }

  libelleType(type: string): string {
    return type === 'EMPLOYE_SEUL' ? 'Employé seul' : 'Famille entière';
  }

  classeBadgeStatut(statut: string): string {
    switch (statut) {
      case 'COMPLETE':
        return 'badge-active';
      case 'EN_COURS':
        return 'badge-expire-bientot';
      default:
        return 'badge-inactif';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'COMPLETE':
        return 'Terminé';
      case 'EN_COURS':
        return 'En cours';
      default:
        return 'Programmé';
    }
  }

  supprimer(renouvellement: Renouvellement): void {

    const confirmation = confirm(`Supprimer le renouvellement de ${renouvellement.expatrieNomComplet} ?`);

    if (!confirmation) {
      return;
    }

    this.renouvellementService.supprimer(renouvellement.id).subscribe({
      next: () => this.charger(),
      error: () => {
        this.messageErreur = "Suppression impossible.";
      }
    });
  }
}
