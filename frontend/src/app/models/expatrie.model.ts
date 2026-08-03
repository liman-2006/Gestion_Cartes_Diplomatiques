export interface Expatrie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  email: string | null;
  telephone: string | null;
  dateArrivee: string | null;
  actif: boolean;
}

export interface ExpatrieRequest {
  nom: string;
  prenom: string;
  matricule: string;
  email: string | null;
  telephone: string | null;
  dateArrivee: string | null;
}
