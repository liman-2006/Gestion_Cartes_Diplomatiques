import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  DocumentRenouvellementRequest,
  Renouvellement,
  RenouvellementRequest
} from '../models/renouvellement.model';

@Injectable({ providedIn: 'root' })
export class RenouvellementService {

  private readonly baseUrl = `${environment.apiUrl}/renouvellements`;

  constructor(private http: HttpClient) {}

  listerTous(): Observable<Renouvellement[]> {
    return this.http.get<Renouvellement[]>(this.baseUrl);
  }

  listerParExpatrie(expatrieId: number): Observable<Renouvellement[]> {
    return this.http.get<Renouvellement[]>(`${this.baseUrl}/expatrie/${expatrieId}`);
  }

  trouverParId(id: number): Observable<Renouvellement> {
    return this.http.get<Renouvellement>(`${this.baseUrl}/${id}`);
  }

  creer(request: RenouvellementRequest): Observable<Renouvellement> {
    return this.http.post<Renouvellement>(this.baseUrl, request);
  }

  modifier(id: number, request: RenouvellementRequest): Observable<Renouvellement> {
    return this.http.put<Renouvellement>(`${this.baseUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  ajouterDocument(renouvellementId: number, request: DocumentRenouvellementRequest): Observable<Renouvellement> {
    return this.http.post<Renouvellement>(`${this.baseUrl}/${renouvellementId}/documents`, request);
  }

  basculerDocumentRecu(documentId: number): Observable<Renouvellement> {
    return this.http.patch<Renouvellement>(`${this.baseUrl}/documents/${documentId}/basculer`, {});
  }

  supprimerDocument(documentId: number): Observable<Renouvellement> {
    return this.http.delete<Renouvellement>(`${this.baseUrl}/documents/${documentId}`);
  }
}
