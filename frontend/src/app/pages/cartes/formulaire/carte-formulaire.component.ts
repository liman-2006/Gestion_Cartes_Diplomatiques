import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CarteService } from '../../../core/carte.service';
import { ExpatrieService } from '../../../core/expatrie.service';
import { MembreFamilleService } from '../../../core/membre-famille.service';
import { Expatrie } from '../../../models/expatrie.model';
import { MembreFamille } from '../../../models/membre-famille.model';

type TypeBeneficiaire = 'EXPATRIE' | 'MEMBRE';

@Component({
  selector: 'app-carte-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './carte-formulaire.component.html'
})
export class CarteFormulaireComponent implements OnInit {

  private fb = inject(FormBuilder);
  private carteService = inject(CarteService);
  private expatrieService = inject(ExpatrieService);
  private membreFamilleService = inject(MembreFamilleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  chargement = false;
  messageErreur: string | null = null;
  expatries: Expatrie[] = [];
  membres: MembreFamille[] = [];

  formulaire = this.fb.group({
    numeroCarte: ['', Validators.required],
    dateDelivrance: ['', Validators.required],
    dateExpiration: ['', Validators.required],
    typeBeneficiaire: ['EXPATRIE' as TypeBeneficiaire, Validators.required],
    expatrieId: [null as number | null],
    membreFamilleId: [null as number | null]
  });

  get modeEdition(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {

    this.expatrieService.listerTous().subscribe({
      next: (donnees) => (this.expatries = donnees)
    });

    this.membreFamilleService.listerTous().subscribe({
      next: (donnees) => (this.membres = donnees)
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id = Number(idParam);
      this.chargement = true;
      this.carteService.trouverParId(this.id).subscribe({
        next: (carte) => {
          this.formulaire.patchValue({
            numeroCarte: carte.numeroCarte,
            dateDelivrance: carte.dateDelivrance,
            dateExpiration: carte.dateExpiration,
            typeBeneficiaire: carte.membreFamilleId ? 'MEMBRE' : 'EXPATRIE',
            expatrieId: carte.expatrieId,
            membreFamilleId: carte.membreFamilleId
          });
          this.chargement = false;
        },
        error: () => {
          this.messageErreur = "Carte introuvable.";
          this.chargement = false;
        }
      });
    }
  }

  soumettre(): void {

    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    const valeurs = this.formulaire.getRawValue();

    const beneficiaireChoisi = valeurs.typeBeneficiaire === 'EXPATRIE'
      ? valeurs.expatrieId
      : valeurs.membreFamilleId;

    if (!beneficiaireChoisi) {
      this.messageErreur = "Veuillez sélectionner un bénéficiaire.";
      return;
    }

    this.chargement = true;
    this.messageErreur = null;

    const requete = {
      numeroCarte: valeurs.numeroCarte!,
      dateDelivrance: valeurs.dateDelivrance!,
      dateExpiration: valeurs.dateExpiration!,
      expatrieId: valeurs.typeBeneficiaire === 'EXPATRIE' ? Number(beneficiaireChoisi) : null,
      membreFamilleId: valeurs.typeBeneficiaire === 'MEMBRE' ? Number(beneficiaireChoisi) : null
    };

    const observable = this.modeEdition
      ? this.carteService.modifier(this.id!, requete)
      : this.carteService.creer(requete);

    observable.subscribe({
      next: () => this.router.navigate(['/cartes']),
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err?.error?.message ?? "Une erreur est survenue.";
      }
    });
  }
}
