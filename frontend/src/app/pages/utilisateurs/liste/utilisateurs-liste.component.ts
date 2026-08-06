import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UtilisateurService } from '../../../core/utilisateur.service';
import { Utilisateur } from '../../../models/utilisateur.model';

@Component({
  selector: 'app-utilisateurs-liste',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './utilisateurs-liste.component.html'
})
export class UtilisateursListeComponent implements OnInit {

  utilisateurs: Utilisateur[] = [];
  chargement = true;
  messageErreur: string | null = null;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.utilisateurService.listerTous().subscribe({
      next: (donnees) => {
        this.utilisateurs = donnees;
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les utilisateurs.";
        this.chargement = false;
      }
    });
  }

  libelleRole(role: string): string {
    return role === 'RESPONSABLE' ? 'Responsable logistique' : 'Agent';
  }

  classeBadgeRole(role: string): string {
    return role === 'RESPONSABLE' ? 'badge-active' : 'badge-type-expatrie';
  }

  supprimer(utilisateur: Utilisateur): void {

    const confirmation = confirm(`Supprimer l'utilisateur ${utilisateur.prenom} ${utilisateur.nom} ?`);

    if (!confirmation) {
      return;
    }

    this.utilisateurService.supprimer(utilisateur.id).subscribe({
      next: () => this.charger(),
      error: (err) => {
        this.messageErreur = err?.error?.message ?? "Suppression impossible.";
      }
    });
  }
}
