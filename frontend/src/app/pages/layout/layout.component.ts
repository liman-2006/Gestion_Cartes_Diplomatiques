import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CarteService } from '../../core/carte.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  readonly nombreCartesAlerte = signal(0);

  constructor(
    public authService: AuthService,
    private carteService: CarteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carteService.listerTous().subscribe({
      next: (cartes) => {
        const total = cartes.filter(c => c.statut === 'EXPIRE_BIENTOT' || c.statut === 'EXPIREE').length;
        this.nombreCartesAlerte.set(total);
      },
      error: () => this.nombreCartesAlerte.set(0)
    });
  }

  initialesUtilisateur(): string {
    const email = this.authService.currentUserEmail();

    if (!email) {
      return '?';
    }

    return email.substring(0, 2).toUpperCase();
  }

  seDeconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }
}
