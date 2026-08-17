import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ExpatrieService } from '../../../core/expatrie.service';
import { dateNonFuture, messageErreurChamp, validateurChiffres, validateurNom } from '../../../core/validateurs';

@Component({
  selector: 'app-expatrie-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './expatrie-formulaire.component.html'
})
export class ExpatrieFormulaireComponent implements OnInit {

  private fb = inject(FormBuilder);
  private expatrieService = inject(ExpatrieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  chargement = false;
  messageErreur: string | null = null;

  formulaire = this.fb.group({
    nom: ['', [Validators.required, validateurNom]],
    prenom: ['', [Validators.required, validateurNom]],
    matricule: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, validateurChiffres]],
    dateArrivee: ['', [Validators.required, dateNonFuture()]]
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
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id = Number(idParam);
      this.chargement = true;
      this.expatrieService.trouverParId(this.id).subscribe({
        next: (expatrie) => {
          this.formulaire.patchValue(expatrie);
          this.chargement = false;
        },
        error: () => {
          this.messageErreur = "Expatrié introuvable.";
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
      matricule: valeurs.matricule!,
      email: valeurs.email!,
      telephone: valeurs.telephone!,
      dateArrivee: valeurs.dateArrivee!
    };

    const observable = this.modeEdition
      ? this.expatrieService.modifier(this.id!, requete)
      : this.expatrieService.creer(requete);

    observable.subscribe({
      next: () => this.router.navigate(['/expatries']),
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err?.error?.message ?? "Une erreur est survenue.";
      }
    });
  }
}
