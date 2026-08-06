import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CarteService } from '../../../core/carte.service';
import { CarteDiplomatique, StatutCarte } from '../../../models/carte.model';

interface CarteAffichage extends CarteDiplomatique {
  joursRestants: number;
}

@Component({
  selector: 'app-cartes-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cartes-liste.component.html'
})
export class CartesListeComponent implements OnInit {

  cartes: CarteAffichage[] = [];
  cartesFiltrees: CarteAffichage[] = [];
  chargement = true;
  messageErreur: string | null = null;
  termeRecherche = '';
  filtreStatut: StatutCarte | '' = '';

  constructor(private carteService: CarteService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.carteService.listerTous().subscribe({
      next: (donnees) => {
        this.cartes = donnees.map(carte => ({
          ...carte,
          joursRestants: this.calculerJoursRestants(carte.dateExpiration)
        }));
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les cartes diplomatiques.";
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const terme = this.termeRecherche.trim().toLowerCase();

    this.cartesFiltrees = this.cartes.filter(carte => {
      const correspondTerme = !terme
        || carte.numeroCarte.toLowerCase().includes(terme)
        || this.beneficiaire(carte).toLowerCase().includes(terme);
      const correspondStatut = !this.filtreStatut || carte.statut === this.filtreStatut;
      return correspondTerme && correspondStatut;
    });
  }

  private calculerJoursRestants(dateExpiration: string): number {
    const expiration = new Date(dateExpiration);
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    expiration.setHours(0, 0, 0, 0);
    return Math.round((expiration.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));
  }

  beneficiaire(carte: CarteDiplomatique): string {
    if (carte.expatrieNomComplet) {
      return carte.expatrieNomComplet;
    }
    if (carte.membreFamilleNomComplet) {
      return carte.membreFamilleNomComplet;
    }
    return '—';
  }

  classeBadgeType(carte: CarteDiplomatique): string {
    return carte.expatrieId !== null ? 'badge-type-expatrie' : 'badge-type-famille';
  }

  libelleType(carte: CarteDiplomatique): string {
    return carte.expatrieId !== null ? 'Employé' : 'Famille';
  }

  libelleJoursRestants(joursRestants: number): string {
    if (joursRestants < 0) {
      return `${Math.abs(joursRestants)} j de retard`;
    }
    return `${joursRestants} j`;
  }

  classeBadgeStatut(statut: string): string {
    switch (statut) {
      case 'VALIDE':
        return 'badge-active';
      case 'A_RENOUVELER':
        return 'badge-expire-bientot';
      default:
        return 'badge-expiree';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'VALIDE':
        return 'Valide';
      case 'A_RENOUVELER':
        return 'À renouveler';
      default:
        return 'Expirée';
    }
  }

  supprimer(carte: CarteDiplomatique): void {

    const confirmation = confirm(`Supprimer la carte n°${carte.numeroCarte} ?`);

    if (!confirmation) {
      return;
    }

    this.carteService.supprimer(carte.id).subscribe({
      next: () => this.charger(),
      error: () => {
        this.messageErreur = "Suppression impossible.";
      }
    });
  }
}
