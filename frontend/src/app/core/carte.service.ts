import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CarteDiplomatique, CarteDiplomatiqueRequest } from '../models/carte.model';

@Injectable({ providedIn: 'root' })
export class CarteService {

  private readonly baseUrl = `${environment.apiUrl}/cartes`;

  constructor(private http: HttpClient) {}

  listerTous(): Observable<CarteDiplomatique[]> {
    return this.http.get<CarteDiplomatique[]>(this.baseUrl);
  }

  trouverParId(id: number): Observable<CarteDiplomatique> {
    return this.http.get<CarteDiplomatique>(`${this.baseUrl}/${id}`);
  }

  creer(request: CarteDiplomatiqueRequest): Observable<CarteDiplomatique> {
    return this.http.post<CarteDiplomatique>(this.baseUrl, request);
  }

  modifier(id: number, request: CarteDiplomatiqueRequest): Observable<CarteDiplomatique> {
    return this.http.put<CarteDiplomatique>(`${this.baseUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
