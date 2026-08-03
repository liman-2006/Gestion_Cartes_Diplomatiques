import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  chargement = false;
  messageErreur: string | null = null;

  formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required]
  });

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
}
