import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ExpatrieService } from '../../../core/expatrie.service';
import { MembreFamilleService } from '../../../core/membre-famille.service';
import { CarteService } from '../../../core/carte.service';
import { Expatrie } from '../../../models/expatrie.model';

interface ExpatrieAffichage extends Expatrie {
  nombreMembres: number;
  nombreCartes: number;
  initiales: string;
}

@Component({
  selector: 'app-expatries-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './expatries-liste.component.html'
})
export class ExpatriesListeComponent implements OnInit {

  expatries: ExpatrieAffichage[] = [];
  expatriesFiltres: ExpatrieAffichage[] = [];
  chargement = true;
  messageErreur: string | null = null;
  termeRecherche = '';

  constructor(
    private expatrieService: ExpatrieService,
    private membreFamilleService: MembreFamilleService,
    private carteService: CarteService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    forkJoin({
      expatries: this.expatrieService.listerTous(),
      membres: this.membreFamilleService.listerTous(),
      cartes: this.carteService.listerTous()
    }).subscribe({
      next: ({ expatries, membres, cartes }) => {
        this.expatries = expatries.map(expatrie => {
          const membresDeExpatrie = membres.filter(m => m.expatrieId === expatrie.id);
          const idsMembres = new Set(membresDeExpatrie.map(m => m.id));
          const nombreCartes = cartes.filter(c =>
            c.expatrieId === expatrie.id || (c.membreFamilleId !== null && idsMembres.has(c.membreFamilleId))
          ).length;

          return {
            ...expatrie,
            nombreMembres: membresDeExpatrie.length,
            nombreCartes,
            initiales: this.calculerInitiales(expatrie.prenom, expatrie.nom)
          };
        });
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les expatriés.";
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const terme = this.termeRecherche.trim().toLowerCase();

    if (!terme) {
      this.expatriesFiltres = this.expatries;
      return;
    }

    this.expatriesFiltres = this.expatries.filter(expatrie =>
      `${expatrie.prenom} ${expatrie.nom}`.toLowerCase().includes(terme) ||
      expatrie.matricule.toLowerCase().includes(terme) ||
      (expatrie.email ?? '').toLowerCase().includes(terme)
    );
  }

  private calculerInitiales(prenom: string, nom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
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
