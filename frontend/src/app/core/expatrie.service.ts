import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Expatrie, ExpatrieRequest } from '../models/expatrie.model';

@Injectable({ providedIn: 'root' })
export class ExpatrieService {

  private readonly baseUrl = `${environment.apiUrl}/expatries`;

  constructor(private http: HttpClient) {}

  listerTous(): Observable<Expatrie[]> {
    return this.http.get<Expatrie[]>(this.baseUrl);
  }

  trouverParId(id: number): Observable<Expatrie> {
    return this.http.get<Expatrie>(`${this.baseUrl}/${id}`);
  }

  creer(request: ExpatrieRequest): Observable<Expatrie> {
    return this.http.post<Expatrie>(this.baseUrl, request);
  }

  modifier(id: number, request: ExpatrieRequest): Observable<Expatrie> {
    return this.http.put<Expatrie>(`${this.baseUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
