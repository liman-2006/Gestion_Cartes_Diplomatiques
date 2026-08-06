import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ExpatrieService } from '../../core/expatrie.service';
import { CarteService } from '../../core/carte.service';
import { RapportService } from '../../core/rapport.service';

const NOMS_MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rapports.component.html'
})
export class RapportsComponent implements OnInit {

  chargement = true;
  messageErreur: string | null = null;
  exportEnCours: 'excel' | 'pdf' | null = null;

  nbExpatries = 0;
  nbCartesActives = 0;
  nbExpirant90 = 0;
  nbCartes = 0;

  moisGraphique: { libelle: string; nombre: number; hauteur: number }[] = [];

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
        this.nbCartes = cartes.length;
        this.nbCartesActives = cartes.filter(c => c.statut === 'VALIDE').length;

        const aujourdHui = new Date();
        aujourdHui.setHours(0, 0, 0, 0);
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

        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les données du rapport.";
        this.chargement = false;
      }
    });
  }

  private telecharger(blob: Blob, nomFichier: string): void {
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.click();
    URL.revokeObjectURL(url);
  }

  exporterExcel(): void {
    this.exportEnCours = 'excel';
    this.rapportService.exporterExcel().subscribe({
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
    this.rapportService.exporterPdf().subscribe({
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
