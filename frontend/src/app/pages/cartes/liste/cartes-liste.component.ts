import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CarteService } from '../../../core/carte.service';
import { CarteDiplomatique } from '../../../models/carte.model';

@Component({
  selector: 'app-cartes-liste',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cartes-liste.component.html'
})
export class CartesListeComponent implements OnInit {

  cartes: CarteDiplomatique[] = [];
  chargement = true;
  messageErreur: string | null = null;

  constructor(private carteService: CarteService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.carteService.listerTous().subscribe({
      next: (donnees) => {
        this.cartes = donnees;
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les cartes diplomatiques.";
        this.chargement = false;
      }
    });
  }

  beneficiaire(carte: CarteDiplomatique): string {
    if (carte.expatrieNomComplet) {
      return `${carte.expatrieNomComplet} (expatrié)`;
    }
    if (carte.membreFamilleNomComplet) {
      return `${carte.membreFamilleNomComplet} (membre de famille)`;
    }
    return '—';
  }

  classeBadgeStatut(statut: string): string {
    switch (statut) {
      case 'ACTIVE':
        return 'badge-active';
      case 'EXPIRE_BIENTOT':
        return 'badge-expire-bientot';
      default:
        return 'badge-expiree';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'ACTIVE':
        return 'Active';
      case 'EXPIRE_BIENTOT':
        return 'Expire bientôt';
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
