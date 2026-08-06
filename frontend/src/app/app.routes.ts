import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { responsableGuard } from './core/responsable.guard';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ExpatriesListeComponent } from './pages/expatries/liste/expatries-liste.component';
import { ExpatrieFormulaireComponent } from './pages/expatries/formulaire/expatrie-formulaire.component';
import { MembresFamilleListeComponent } from './pages/membres-famille/liste/membres-famille-liste.component';
import { MembreFamilleFormulaireComponent } from './pages/membres-famille/formulaire/membre-famille-formulaire.component';
import { CartesListeComponent } from './pages/cartes/liste/cartes-liste.component';
import { CarteFormulaireComponent } from './pages/cartes/formulaire/carte-formulaire.component';
import { ParametresComponent } from './pages/parametres/parametres.component';

export const routes: Routes = [
  { path: 'connexion', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },

      { path: 'tableau-de-bord', component: DashboardComponent },

      { path: 'expatries', component: ExpatriesListeComponent },
      { path: 'expatries/nouveau', component: ExpatrieFormulaireComponent },
      { path: 'expatries/:id/modifier', component: ExpatrieFormulaireComponent },

      { path: 'membres-famille', component: MembresFamilleListeComponent },
      { path: 'membres-famille/nouveau', component: MembreFamilleFormulaireComponent },
      { path: 'membres-famille/:id/modifier', component: MembreFamilleFormulaireComponent },

      { path: 'cartes', component: CartesListeComponent },
      { path: 'cartes/nouveau', component: CarteFormulaireComponent },
      { path: 'cartes/:id/modifier', component: CarteFormulaireComponent },

      { path: 'parametres', component: ParametresComponent, canActivate: [responsableGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
