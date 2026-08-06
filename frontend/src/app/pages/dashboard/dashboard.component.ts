import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ExpatrieService } from '../../core/expatrie.service';
import { MembreFamilleService } from '../../core/membre-famille.service';
import { CarteService } from '../../core/carte.service';
import { Expatrie } from '../../models/expatrie.model';
import { MembreFamille } from '../../models/membre-famille.model';
import { CarteDiplomatique } from '../../models/carte.model';

interface CarteAvecJours extends CarteDiplomatique {
  joursRestants: number;
  beneficiaire: string;
}

const NOMS_MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  chargement = true;
  messageErreur: string | null = null;

  nbExpatries = 0;
  nbFamilles = 0;
  nbCartes = 0;
  nbCartesActives = 0;
  nbCartesExpirees = 0;
  nbExpirant90 = 0;
  nbExpirant60 = 0;
  nbExpirant30 = 0;

  moisGraphique: { libelle: string; nombre: number; hauteur: number }[] = [];

  pctEmployes = 0;
  pctFamille = 0;
  degradeRepartition = '';

  alertesRecentes: CarteAvecJours[] = [];
  prochainesExpirations: CarteAvecJours[] = [];

  constructor(
    private expatrieService: ExpatrieService,
    private membreFamilleService: MembreFamilleService,
    private carteService: CarteService
  ) {}

  ngOnInit(): void {
    forkJoin({
      expatries: this.expatrieService.listerTous(),
      membres: this.membreFamilleService.listerTous(),
      cartes: this.carteService.listerTous()
    }).subscribe({
      next: ({ expatries, membres, cartes }) => this.traiterDonnees(expatries, membres, cartes),
      error: () => {
        this.messageErreur = 'Impossible de charger les données du tableau de bord.';
        this.chargement = false;
      }
    });
  }

  private traiterDonnees(expatries: Expatrie[], membres: MembreFamille[], cartes: CarteDiplomatique[]): void {

    this.nbExpatries = expatries.length;
    this.nbFamilles = membres.length;
    this.nbCartes = cartes.length;
    this.nbCartesActives = cartes.filter(c => c.statut === 'ACTIVE').length;
    this.nbCartesExpirees = cartes.filter(c => c.statut === 'EXPIREE').length;

    const cartesAvecJours: CarteAvecJours[] = cartes.map(carte => ({
      ...carte,
      joursRestants: this.calculerJoursRestants(carte.dateExpiration),
      beneficiaire: carte.expatrieNomComplet ?? carte.membreFamilleNomComplet ?? '—'
    }));

    this.nbExpirant90 = cartesAvecJours.filter(c => c.joursRestants >= 0 && c.joursRestants <= 90).length;
    this.nbExpirant60 = cartesAvecJours.filter(c => c.joursRestants >= 0 && c.joursRestants <= 60).length;
    this.nbExpirant30 = cartesAvecJours.filter(c => c.joursRestants >= 0 && c.joursRestants <= 30).length;

    const comptesParMois = new Array(12).fill(0);
    for (const carte of cartes) {
      const date = new Date(carte.dateExpiration);
      if (!isNaN(date.getTime())) {
        comptesParMois[date.getMonth()]++;
      }
    }
    const maxMois = Math.max(...comptesParMois, 1);
    this.moisGraphique = NOMS_MOIS.map((libelle, index) => ({
      libelle,
      nombre: comptesParMois[index],
      hauteur: Math.round((comptesParMois[index] / maxMois) * 100)
    }));

    const nbEmployes = cartes.filter(c => c.expatrieId !== null).length;
    const nbFamille = cartes.filter(c => c.membreFamilleId !== null).length;
    const total = Math.max(nbEmployes + nbFamille, 1);
    this.pctEmployes = Math.round((nbEmployes / total) * 100);
    this.pctFamille = 100 - this.pctEmployes;
    this.degradeRepartition = `conic-gradient(#1d4ed8 0 ${this.pctEmployes}%, #93c5fd ${this.pctEmployes}% 100%)`;

    this.alertesRecentes = cartesAvecJours
      .filter(c => c.statut === 'EXPIRE_BIENTOT' || c.statut === 'EXPIREE')
      .sort((a, b) => a.joursRestants - b.joursRestants)
      .slice(0, 5);

    this.prochainesExpirations = cartesAvecJours
      .filter(c => c.statut !== 'EXPIREE')
      .sort((a, b) => a.joursRestants - b.joursRestants)
      .slice(0, 5);

    this.chargement = false;
  }

  private calculerJoursRestants(dateExpiration: string): number {
    const expiration = new Date(dateExpiration);
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    expiration.setHours(0, 0, 0, 0);
    return Math.round((expiration.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));
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
}
