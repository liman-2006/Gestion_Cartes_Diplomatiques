import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CarteService } from '../../core/carte.service';
import { ThemeService } from '../../core/theme.service';

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
    public themeService: ThemeService,
    private carteService: CarteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carteService.listerTous().subscribe({
      next: (cartes) => {
        const total = cartes.filter(c => c.statut === 'A_RENOUVELER' || c.statut === 'EXPIREE').length;
        this.nombreCartesAlerte.set(total);
      },
      error: () => this.nombreCartesAlerte.set(0)
    });
  }

  libelleRole(): string {
    return this.authService.currentUserRole() === 'RESPONSABLE'
      ? 'Responsable logistique'
      : 'Agent';
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

  allerAuxNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
