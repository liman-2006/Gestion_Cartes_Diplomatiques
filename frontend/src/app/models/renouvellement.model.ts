export type TypeRenouvellement = 'EMPLOYE_SEUL' | 'FAMILLE_ENTIERE';
export type StatutRenouvellement = 'PROGRAMME' | 'EN_COURS' | 'COMPLETE';

export interface DocumentRenouvellement {
  id: number;
  renouvellementId: number;
  nomDocument: string;
  recu: boolean;
}

export interface Renouvellement {
  id: number;
  expatrieId: number;
  expatrieNomComplet: string;
  typeRenouvellement: TypeRenouvellement;
  dateProgrammee: string;
  statut: StatutRenouvellement;
  notes: string | null;
  carteGenereeId: number | null;
  carteGenereeNumero: string | null;
  documents: DocumentRenouvellement[];
}

export interface RenouvellementRequest {
  expatrieId: number;
  typeRenouvellement: TypeRenouvellement;
  dateProgrammee: string;
  notes: string | null;
}

export interface DocumentRenouvellementRequest {
  nomDocument: string;
}
