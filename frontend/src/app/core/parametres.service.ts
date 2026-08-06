import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Parametres, ParametresRequest } from '../models/parametres.model';

@Injectable({ providedIn: 'root' })
export class ParametresService {

  private readonly baseUrl = `${environment.apiUrl}/parametres`;

  constructor(private http: HttpClient) {}

  obtenir(): Observable<Parametres> {
    return this.http.get<Parametres>(this.baseUrl);
  }

  modifier(request: ParametresRequest): Observable<Parametres> {
    return this.http.put<Parametres>(this.baseUrl, request);
  }
}
