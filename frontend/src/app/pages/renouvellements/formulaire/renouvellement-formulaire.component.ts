import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RenouvellementService } from '../../../core/renouvellement.service';
import { ExpatrieService } from '../../../core/expatrie.service';
import { AuthService } from '../../../core/auth.service';
import { Expatrie } from '../../../models/expatrie.model';
import { Renouvellement, TypeRenouvellement } from '../../../models/renouvellement.model';

@Component({
  selector: 'app-renouvellement-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './renouvellement-formulaire.component.html'
})
export class RenouvellementFormulaireComponent implements OnInit {

  private fb = inject(FormBuilder);
  private renouvellementService = inject(RenouvellementService);
  private expatrieService = inject(ExpatrieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public authService = inject(AuthService);

  id: number | null = null;
  chargement = false;
  messageErreur: string | null = null;
  expatries: Expatrie[] = [];
  renouvellement: Renouvellement | null = null;
  nouveauNomDocument = '';

  formulaire = this.fb.group({
    expatrieId: [null as number | null, Validators.required],
    typeRenouvellement: ['EMPLOYE_SEUL' as TypeRenouvellement, Validators.required],
    dateProgrammee: ['', Validators.required],
    notes: ['']
  });

  get modeEdition(): boolean {
    return this.id !== null;
  }

  get lectureSeule(): boolean {
    return this.modeEdition && !this.authService.isResponsable();
  }

  ngOnInit(): void {

    this.expatrieService.listerTous().subscribe({
      next: (donnees) => (this.expatries = donnees)
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id = Number(idParam);
      this.chargerRenouvellement();
    }
  }

  private chargerRenouvellement(): void {
    this.chargement = true;
    this.renouvellementService.trouverParId(this.id!).subscribe({
      next: (renouvellement) => {
        this.renouvellement = renouvellement;
        this.formulaire.patchValue({
          expatrieId: renouvellement.expatrieId,
          typeRenouvellement: renouvellement.typeRenouvellement,
          dateProgrammee: renouvellement.dateProgrammee,
          notes: renouvellement.notes ?? ''
        });
        if (this.lectureSeule) {
          this.formulaire.disable();
        }
        this.chargement = false;
      },
      error: () => {
        this.messageErreur = "Renouvellement introuvable.";
        this.chargement = false;
      }
    });
  }

  soumettre(): void {

    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    const valeurs = this.formulaire.getRawValue();

    this.chargement = true;
    this.messageErreur = null;

    const requete = {
      expatrieId: valeurs.expatrieId!,
      typeRenouvellement: valeurs.typeRenouvellement!,
      dateProgrammee: valeurs.dateProgrammee!,
      notes: valeurs.notes || null
    };

    const observable = this.modeEdition
      ? this.renouvellementService.modifier(this.id!, requete)
      : this.renouvellementService.creer(requete);

    observable.subscribe({
      next: (renouvellement) => {
        this.chargement = false;
        if (!this.modeEdition) {
          this.router.navigate(['/renouvellements', renouvellement.id, 'modifier']);
        } else {
          this.renouvellement = renouvellement;
        }
      },
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err?.error?.message ?? "Une erreur est survenue.";
      }
    });
  }

  ajouterDocument(): void {

    const nom = this.nouveauNomDocument.trim();

    if (!nom || !this.renouvellement) {
      return;
    }

    this.renouvellementService.ajouterDocument(this.renouvellement.id, { nomDocument: nom }).subscribe({
      next: (renouvellement) => {
        this.renouvellement = renouvellement;
        this.nouveauNomDocument = '';
      },
      error: () => {
        this.messageErreur = "Impossible d'ajouter le document.";
      }
    });
  }

  basculerDocument(documentId: number): void {
    this.renouvellementService.basculerDocumentRecu(documentId).subscribe({
      next: (renouvellement) => (this.renouvellement = renouvellement),
      error: () => {
        this.messageErreur = "Impossible de mettre à jour le document.";
      }
    });
  }

  supprimerDocument(documentId: number): void {
    this.renouvellementService.supprimerDocument(documentId).subscribe({
      next: (renouvellement) => (this.renouvellement = renouvellement),
      error: () => {
        this.messageErreur = "Impossible de supprimer le document.";
      }
    });
  }

  classeBadgeStatut(statut: string): string {
    switch (statut) {
      case 'COMPLETE':
        return 'badge-active';
      case 'EN_COURS':
        return 'badge-expire-bientot';
      default:
        return 'badge-inactif';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'COMPLETE':
        return 'Terminé';
      case 'EN_COURS':
        return 'En cours';
      default:
        return 'Programmé';
    }
  }
}
