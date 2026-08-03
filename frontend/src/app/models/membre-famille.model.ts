export interface MembreFamille {
  id: number;
  nom: string;
  prenom: string;
  lienParente: string | null;
  dateNaissance: string | null;
  expatrieId: number;
  expatrieNomComplet: string;
}

export interface MembreFamilleRequest {
  nom: string;
  prenom: string;
  lienParente: string | null;
  dateNaissance: string | null;
  expatrieId: number;
}
