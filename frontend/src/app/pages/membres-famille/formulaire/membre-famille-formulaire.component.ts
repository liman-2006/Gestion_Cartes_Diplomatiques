import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MembreFamilleService } from '../../../core/membre-famille.service';
import { ExpatrieService } from '../../../core/expatrie.service';
import { Expatrie } from '../../../models/expatrie.model';
import { dateNonFuture, messageErreurChamp, validateurNom } from '../../../core/validateurs';

export const LIENS_PARENTE = ['Conjoint(e)', 'Enfant', 'Père', 'Mère', 'Frère', 'Sœur', 'Autre'];

@Component({
  selector: 'app-membre-famille-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './membre-famille-formulaire.component.html'
})
export class MembreFamilleFormulaireComponent implements OnInit {

  private fb = inject(FormBuilder);
  private membreFamilleService = inject(MembreFamilleService);
  private expatrieService = inject(ExpatrieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  chargement = false;
  messageErreur: string | null = null;
  expatries: Expatrie[] = [];
  liensParente = LIENS_PARENTE;

  formulaire = this.fb.group({
    nom: ['', [Validators.required, validateurNom]],
    prenom: ['', [Validators.required, validateurNom]],
    lienParente: ['', Validators.required],
    dateNaissance: ['', [Validators.required, dateNonFuture()]],
    expatrieId: [null as number | null, Validators.required]
  });

  erreur(champ: string, libelle: string): string | null {
    const controle = this.formulaire.get(champ);
    if (!controle || !controle.touched) {
      return null;
    }
    return messageErreurChamp(controle.errors, libelle);
  }

  get modeEdition(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {

    this.expatrieService.listerTous().subscribe({
      next: (donnees) => (this.expatries = donnees)
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id = Number(idParam);
      this.chargement = true;
      this.membreFamilleService.trouverParId(this.id).subscribe({
        next: (membre) => {
          this.formulaire.patchValue(membre);
          this.chargement = false;
        },
        error: () => {
          this.messageErreur = "Membre de famille introuvable.";
          this.chargement = false;
        }
      });
    }
  }

  soumettre(): void {

    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.messageErreur = "Veuillez corriger les champs en rouge avant de continuer.";
      return;
    }

    this.chargement = true;
    this.messageErreur = null;

    const valeurs = this.formulaire.getRawValue();
    const requete = {
      nom: valeurs.nom!,
      prenom: valeurs.prenom!,
      lienParente: valeurs.lienParente!,
      dateNaissance: valeurs.dateNaissance!,
      expatrieId: Number(valeurs.expatrieId)
    };

    const observable = this.modeEdition
      ? this.membreFamilleService.modifier(this.id!, requete)
      : this.membreFamilleService.creer(requete);

    observable.subscribe({
      next: () => this.router.navigate(['/membres-famille']),
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err?.error?.message ?? "Une erreur est survenue.";
      }
    });
  }
}
