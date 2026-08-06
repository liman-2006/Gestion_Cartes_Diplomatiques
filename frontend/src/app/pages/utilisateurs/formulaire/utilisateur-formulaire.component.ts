import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UtilisateurService } from '../../../core/utilisateur.service';
import { RoleType } from '../../../models/utilisateur.model';

@Component({
  selector: 'app-utilisateur-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './utilisateur-formulaire.component.html'
})
export class UtilisateurFormulaireComponent implements OnInit {

  private fb = inject(FormBuilder);
  private utilisateurService = inject(UtilisateurService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  chargement = false;
  messageErreur: string | null = null;

  formulaire = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: [''],
    actif: [true],
    role: ['AGENT' as RoleType, Validators.required]
  });

  get modeEdition(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {

    if (!this.modeEdition) {
      this.formulaire.get('motDePasse')?.addValidators(Validators.required);
    }

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id = Number(idParam);
      this.chargement = true;
      this.utilisateurService.trouverParId(this.id).subscribe({
        next: (utilisateur) => {
          this.formulaire.patchValue({
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            actif: utilisateur.actif,
            role: utilisateur.role
          });
          this.chargement = false;
        },
        error: () => {
          this.messageErreur = "Utilisateur introuvable.";
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

    this.chargement = true;
    this.messageErreur = null;

    const requete = {
      nom: valeurs.nom!,
      prenom: valeurs.prenom!,
      email: valeurs.email!,
      motDePasse: valeurs.motDePasse || null,
      actif: valeurs.actif!,
      role: valeurs.role!
    };

    const observable = this.modeEdition
      ? this.utilisateurService.modifier(this.id!, requete)
      : this.utilisateurService.creer(requete);

    observable.subscribe({
      next: () => this.router.navigate(['/utilisateurs']),
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err?.error?.message ?? "Une erreur est survenue.";
      }
    });
  }
}
