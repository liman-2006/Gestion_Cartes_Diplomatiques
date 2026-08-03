import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { MembreFamille, MembreFamilleRequest } from '../models/membre-famille.model';

@Injectable({ providedIn: 'root' })
export class MembreFamilleService {

  private readonly baseUrl = `${environment.apiUrl}/membres-famille`;

  constructor(private http: HttpClient) {}

  listerTous(): Observable<MembreFamille[]> {
    return this.http.get<MembreFamille[]>(this.baseUrl);
  }

  listerParExpatrie(expatrieId: number): Observable<MembreFamille[]> {
    return this.http.get<MembreFamille[]>(`${this.baseUrl}/expatrie/${expatrieId}`);
  }

  trouverParId(id: number): Observable<MembreFamille> {
    return this.http.get<MembreFamille>(`${this.baseUrl}/${id}`);
  }

  creer(request: MembreFamilleRequest): Observable<MembreFamille> {
    return this.http.post<MembreFamille>(this.baseUrl, request);
  }

  modifier(id: number, request: MembreFamilleRequest): Observable<MembreFamille> {
    return this.http.put<MembreFamille>(`${this.baseUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
