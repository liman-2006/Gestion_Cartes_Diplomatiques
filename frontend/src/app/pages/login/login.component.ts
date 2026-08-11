import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

interface PointFort {
  icone: string;
  titre: string;
  description: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  chargement = false;
  messageErreur: string | null = null;
  afficherMotDePasse = false;

  readonly heureActuelle = signal(this.formaterHeure(new Date()));
  readonly dateActuelle = signal(this.formaterDate(new Date()));

  private intervalleHorloge: ReturnType<typeof setInterval> | null = null;

  readonly pointsForts: PointFort[] = [
    {
      icone: 'carte',
      titre: 'Inventaire centralisé',
      description: 'Toutes les cartes diplomatiques des expatriés et de leurs familles au même endroit.'
    },
    {
      icone: 'horloge',
      titre: 'Renouvellements automatisés',
      description: "L'expiration est calculée automatiquement et suivie sans intervention manuelle."
    },
    {
      icone: 'alerte',
      titre: 'Alertes proactives',
      description: 'Notifications avant chaque échéance pour ne jamais manquer un renouvellement.'
    },
    {
      icone: 'rapport',
      titre: 'Rapports en un clic',
      description: "Export Excel et PDF filtrés pour vos besoins d'audit et de reporting."
    }
  ];

  formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required]
  });

  ngOnInit(): void {
    this.intervalleHorloge = setInterval(() => {
      const maintenant = new Date();
      this.heureActuelle.set(this.formaterHeure(maintenant));
      this.dateActuelle.set(this.formaterDate(maintenant));
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalleHorloge !== null) {
      clearInterval(this.intervalleHorloge);
    }
  }

  basculerAffichageMotDePasse(): void {
    this.afficherMotDePasse = !this.afficherMotDePasse;
  }

  soumettre(): void {

    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.messageErreur = null;

    const { email, motDePasse } = this.formulaire.getRawValue();

    this.authService.login({ email: email!, motDePasse: motDePasse! }).subscribe({
      next: () => {
        this.chargement = false;
        this.router.navigate(['/expatries']);
      },
      error: (err) => {
        this.chargement = false;
        this.messageErreur =
          err?.error?.message ?? 'Email ou mot de passe incorrect.';
      }
    });
  }

  private formaterHeure(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  private formaterDate(date: Date): string {
    return `${JOURS[date.getDay()]} ${date.getDate()} ${MOIS[date.getMonth()]} ${date.getFullYear()}`;
  }
}
