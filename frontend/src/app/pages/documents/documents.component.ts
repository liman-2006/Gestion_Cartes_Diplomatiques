import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RenouvellementService } from '../../core/renouvellement.service';

interface LigneDocument {
  documentId: number;
  renouvellementId: number;
  beneficiaire: string;
  nomDocument: string;
  recu: boolean;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documents.component.html'
})
export class DocumentsComponent implements OnInit {

  lignes: LigneDocument[] = [];
  lignesFiltrees: LigneDocument[] = [];
  chargement = true;
  messageErreur: string | null = null;
  termeRecherche = '';

  constructor(private renouvellementService: RenouvellementService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.renouvellementService.listerTous().subscribe({
      next: (renouvellements) => {
        this.lignes = renouvellements.flatMap(r =>
          r.documents.map(doc => ({
            documentId: doc.id,
            renouvellementId: r.id,
            beneficiaire: r.expatrieNomComplet,
            nomDocument: doc.nomDocument,
            recu: doc.recu
          }))
        );
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Impossible de charger les documents.";
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const terme = this.termeRecherche.trim().toLowerCase();

    this.lignesFiltrees = !terme
      ? this.lignes
      : this.lignes.filter(l =>
          l.beneficiaire.toLowerCase().includes(terme) ||
          l.nomDocument.toLowerCase().includes(terme)
        );
  }

  basculerRecu(ligne: LigneDocument): void {
    this.renouvellementService.basculerDocumentRecu(ligne.documentId).subscribe({
      next: () => this.charger(),
      error: () => {
        this.messageErreur = "Impossible de mettre à jour le document.";
      }
    });
  }
}
