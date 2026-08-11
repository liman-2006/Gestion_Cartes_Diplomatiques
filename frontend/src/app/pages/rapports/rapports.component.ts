import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ExpatrieService } from '../../core/expatrie.service';
import { CarteService } from '../../core/carte.service';
import { RapportService } from '../../core/rapport.service';
import { CarteDiplomatique, StatutCarte } from '../../models/carte.model';

const NOMS_MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

type FiltreBeneficiaire = 'EXPATRIE' | 'MEMBRE' | '';

interface CarteAffichage extends CarteDiplomatique {
  joursRestants: number;
}

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rapports.component.html'
})
export class RapportsComponent implements OnInit {

  chargement = true;
  messageErreur: string | null = null;
  exportEnCours: 'excel' | 'pdf' | null = null;

  filtreStatut: StatutCarte | '' = '';
  filtreBeneficiaire: FiltreBeneficiaire = '';
  filtreAnnee: number | '' = '';
  dateDebut = '';
  dateFin = '';

  anneesDisponibles: number[] = [];

  nbExpatries = 0;
  nbCartesActives = 0;
  nbExpirant90 = 0;
  nbCartes = 0;

  moisGraphique: { libelle: string; nombre: number; hauteur: number }[] = [];
  cartesFiltrees: CarteAffichage[] = [];

  private toutesLesCartes: CarteDiplomatique[] = [];

  constructor(
    private expatrieService: ExpatrieService,
    private carteService: CarteService,
    private rapportService: RapportService
  ) {}

  ngOnInit(): void {
    forkJoin({
      expatries: this.expatrieService.listerTous(),
      cartes: this.carteService.listerTous()
    }).subscribe({
      next: ({ expatries, cartes }) => {
        this.nbExpatries = expatries.length;
        this.toutesLesCartes = cartes;
        this.anneesDisponibles = Array.from(
          new Set(cartes.map(c => new Date(c.dateDelivrance).getFullYear()).filter(a => !isNaN(a)))
        ).sort((a, b) => b - a);
        this.appliquerFiltres();
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les données du rapport.";
        this.chargement = false;
      }
    });
  }

  appliquerFiltres(): void {

    const { debut, fin } = this.plagePeriode();

    const cartes = this.toutesLesCartes.filter(carte => {
      const correspondStatut = !this.filtreStatut || carte.statut === this.filtreStatut;
      const correspondBeneficiaire = !this.filtreBeneficiaire
        || (this.filtreBeneficiaire === 'EXPATRIE' && carte.expatrieId !== null)
        || (this.filtreBeneficiaire === 'MEMBRE' && carte.membreFamilleId !== null);
      const correspondPeriode = (!debut || carte.dateDelivrance >= debut)
        && (!fin || carte.dateDelivrance <= fin);
      return correspondStatut && correspondBeneficiaire && correspondPeriode;
    });

    this.nbCartes = cartes.length;
    this.nbCartesActives = cartes.filter(c => c.statut === 'VALIDE').length;

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    this.cartesFiltrees = cartes
      .map(carte => ({ ...carte, joursRestants: this.calculerJoursRestants(carte.dateExpiration) }))
      .sort((a, b) => a.dateDelivrance < b.dateDelivrance ? 1 : -1);

    this.nbExpirant90 = cartes.filter(c => {
      const expiration = new Date(c.dateExpiration);
      expiration.setHours(0, 0, 0, 0);
      const jours = Math.round((expiration.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));
      return jours >= 0 && jours <= 90;
    }).length;

    const comptesParMois = new Array(12).fill(0);
    for (const carte of cartes) {
      const date = new Date(carte.dateDelivrance);
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
  }

  reinitialiserPeriode(): void {
    this.filtreAnnee = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.appliquerFiltres();
  }

  private plagePeriode(): { debut?: string; fin?: string } {

    if (this.dateDebut && this.dateFin) {
      return { debut: this.dateDebut, fin: this.dateFin };
    }

    if (this.filtreAnnee) {
      return { debut: `${this.filtreAnnee}-01-01`, fin: `${this.filtreAnnee}-12-31` };
    }

    return {};
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

  private telecharger(blob: Blob, nomFichier: string): void {
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.click();
    URL.revokeObjectURL(url);
  }

  private filtresActifs() {
    const { debut, fin } = this.plagePeriode();
    return {
      statut: this.filtreStatut || undefined,
      type: this.filtreBeneficiaire || undefined,
      dateDebut: debut,
      dateFin: fin
    };
  }

  exporterExcel(): void {
    this.exportEnCours = 'excel';
    this.rapportService.exporterExcel(this.filtresActifs()).subscribe({
      next: (blob) => {
        this.telecharger(blob, 'cartes-diplomatiques.xlsx');
        this.exportEnCours = null;
      },
      error: () => {
        this.messageErreur = "Impossible de générer l'export Excel.";
        this.exportEnCours = null;
      }
    });
  }

  exporterPdf(): void {
    this.exportEnCours = 'pdf';
    this.rapportService.exporterPdf(this.filtresActifs()).subscribe({
      next: (blob) => {
        this.telecharger(blob, 'cartes-diplomatiques.pdf');
        this.exportEnCours = null;
      },
      error: () => {
        this.messageErreur = "Impossible de générer l'export PDF.";
        this.exportEnCours = null;
      }
    });
  }
}
