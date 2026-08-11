import { Injectable, signal } from '@angular/core';

export type Theme = 'clair' | 'sombre';

const CLE_STOCKAGE = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  readonly theme = signal<Theme>(this.lireThemeInitial());

  constructor() {
    this.appliquer(this.theme());
  }

  basculer(): void {
    this.definir(this.theme() === 'sombre' ? 'clair' : 'sombre');
  }

  definir(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(CLE_STOCKAGE, theme);
    this.appliquer(theme);
  }

  private appliquer(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private lireThemeInitial(): Theme {
    const stocke = localStorage.getItem(CLE_STOCKAGE);

    if (stocke === 'clair' || stocke === 'sombre') {
      return stocke;
    }

    const preferesSombre = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return preferesSombre ? 'sombre' : 'clair';
  }
}
