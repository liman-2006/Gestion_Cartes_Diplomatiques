import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Utilisateur, UtilisateurRequest } from '../models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {

  private readonly baseUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  listerTous(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }

  trouverParId(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.baseUrl}/${id}`);
  }

  creer(request: UtilisateurRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.baseUrl, request);
  }

  modifier(id: number, request: UtilisateurRequest): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.baseUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
