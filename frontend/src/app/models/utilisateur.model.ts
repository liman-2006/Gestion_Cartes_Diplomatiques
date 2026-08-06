export type RoleType = 'AGENT' | 'RESPONSABLE';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  actif: boolean;
  role: RoleType;
}

export interface UtilisateurRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string | null;
  actif: boolean;
  role: RoleType;
}
