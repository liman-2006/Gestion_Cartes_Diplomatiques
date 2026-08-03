import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MembreFamilleService } from '../../../core/membre-famille.service';
import { MembreFamille } from '../../../models/membre-famille.model';

@Component({
  selector: 'app-membres-famille-liste',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './membres-famille-liste.component.html'
})
export class MembresFamilleListeComponent implements OnInit {

  membres: MembreFamille[] = [];
  chargement = true;
  messageErreur: string | null = null;

  constructor(private membreFamilleService: MembreFamilleService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.membreFamilleService.listerTous().subscribe({
      next: (donnees) => {
        this.membres = donnees;
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les membres de famille.";
        this.chargement = false;
      }
    });
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
