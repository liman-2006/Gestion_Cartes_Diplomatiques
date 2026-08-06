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
import { RenouvellementsListeComponent } from './pages/renouvellements/liste/renouvellements-liste.component';
import { RenouvellementFormulaireComponent } from './pages/renouvellements/formulaire/renouvellement-formulaire.component';
import { UtilisateursListeComponent } from './pages/utilisateurs/liste/utilisateurs-liste.component';
import { UtilisateurFormulaireComponent } from './pages/utilisateurs/formulaire/utilisateur-formulaire.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { RapportsComponent } from './pages/rapports/rapports.component';

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

      { path: 'renouvellements', component: RenouvellementsListeComponent },
      { path: 'renouvellements/nouveau', component: RenouvellementFormulaireComponent },
      { path: 'renouvellements/:id/modifier', component: RenouvellementFormulaireComponent },

      { path: 'notifications', component: NotificationsComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'rapports', component: RapportsComponent },

      { path: 'utilisateurs', component: UtilisateursListeComponent, canActivate: [responsableGuard] },
      { path: 'utilisateurs/nouveau', component: UtilisateurFormulaireComponent, canActivate: [responsableGuard] },
      { path: 'utilisateurs/:id/modifier', component: UtilisateurFormulaireComponent, canActivate: [responsableGuard] },

      { path: 'parametres', component: ParametresComponent, canActivate: [responsableGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
