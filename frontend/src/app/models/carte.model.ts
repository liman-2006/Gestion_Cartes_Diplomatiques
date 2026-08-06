export type StatutCarte = 'VALIDE' | 'A_RENOUVELER' | 'EXPIREE';

export interface CarteDiplomatique {
  id: number;
  numeroCarte: string;
  dateDelivrance: string;
  dateExpiration: string;
  statut: StatutCarte;
  expatrieId: number | null;
  expatrieNomComplet: string | null;
  membreFamilleId: number | null;
  membreFamilleNomComplet: string | null;
}

export interface CarteDiplomatiqueRequest {
  numeroCarte: string;
  dateDelivrance: string;
  dateExpiration: string;
  expatrieId: number | null;
  membreFamilleId: number | null;
  renouvellementId?: number | null;
}
