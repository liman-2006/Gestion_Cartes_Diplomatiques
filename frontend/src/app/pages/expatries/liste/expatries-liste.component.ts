import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ExpatrieService } from '../../../core/expatrie.service';
import { Expatrie } from '../../../models/expatrie.model';

@Component({
  selector: 'app-expatries-liste',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expatries-liste.component.html'
})
export class ExpatriesListeComponent implements OnInit {

  expatries: Expatrie[] = [];
  chargement = true;
  messageErreur: string | null = null;

  constructor(private expatrieService: ExpatrieService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.expatrieService.listerTous().subscribe({
      next: (donnees) => {
        this.expatries = donnees;
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les expatriés.";
        this.chargement = false;
      }
    });
  }

  supprimer(expatrie: Expatrie): void {

    const confirmation = confirm(
      `Supprimer l'expatrié ${expatrie.prenom} ${expatrie.nom} ? Cette action supprimera aussi ses membres de famille et cartes associées.`
    );

    if (!confirmation) {
      return;
    }

    this.expatrieService.supprimer(expatrie.id).subscribe({
      next: () => this.charger(),
      error: () => {
        this.messageErreur = "Suppression impossible.";
      }
    });
  }
}
