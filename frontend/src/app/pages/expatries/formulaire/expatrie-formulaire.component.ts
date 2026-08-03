import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ExpatrieService } from '../../../core/expatrie.service';

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
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    matricule: ['', Validators.required],
    email: [''],
    telephone: [''],
    dateArrivee: ['']
  });

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
      return;
    }

    this.chargement = true;
    this.messageErreur = null;

    const valeurs = this.formulaire.getRawValue();
    const requete = {
      nom: valeurs.nom!,
      prenom: valeurs.prenom!,
      matricule: valeurs.matricule!,
      email: valeurs.email || null,
      telephone: valeurs.telephone || null,
      dateArrivee: valeurs.dateArrivee || null
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
