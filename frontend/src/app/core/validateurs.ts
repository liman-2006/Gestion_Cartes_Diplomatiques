import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const MOTIF_NOM = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
export const MOTIF_CHIFFRES = /^[0-9]+$/;

export const validateurNom: ValidatorFn = Validators.pattern(MOTIF_NOM);
export const validateurChiffres: ValidatorFn = Validators.pattern(MOTIF_CHIFFRES);

/** Refuse toute date strictement postérieure à aujourd'hui. */
export function dateNonFuture(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    if (!control.value) {
      return null;
    }

    const aujourdHui = new Date();
    aujourdHui.setHours(23, 59, 59, 999);

    const valeur = new Date(control.value);
    if (isNaN(valeur.getTime())) {
      return null;
    }

    return valeur.getTime() > aujourdHui.getTime() ? { dateFuture: true } : null;
  };
}

/** Refuse toute date strictement antérieure à aujourd'hui. */
export function dateNonPassee(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    if (!control.value) {
      return null;
    }

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    const valeur = new Date(control.value);
    if (isNaN(valeur.getTime())) {
      return null;
    }

    return valeur.getTime() < aujourdHui.getTime() ? { datePassee: true } : null;
  };
}

/** Message d'erreur générique pour un champ, à partir de l'objet errors d'un FormControl. */
export function messageErreurChamp(erreurs: ValidationErrors | null, libelle: string): string | null {

  if (!erreurs) {
    return null;
  }

  if (erreurs['required']) {
    return `${libelle} est obligatoire.`;
  }
  if (erreurs['pattern']) {
    return `${libelle} contient des caractères non autorisés.`;
  }
  if (erreurs['email']) {
    return 'Adresse email invalide.';
  }
  if (erreurs['dateFuture']) {
    return `${libelle} ne peut pas être postérieure à aujourd'hui.`;
  }
  if (erreurs['datePassee']) {
    return `${libelle} ne peut pas être antérieure à aujourd'hui.`;
  }

  return `${libelle} est invalide.`;
}
