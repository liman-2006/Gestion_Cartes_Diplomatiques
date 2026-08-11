import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface FiltresRapport {
  statut?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable({ providedIn: 'root' })
export class RapportService {

  private readonly baseUrl = `${environment.apiUrl}/rapports`;

  constructor(private http: HttpClient) {}

  private construireParametres(filtres?: FiltresRapport): HttpParams {
    let params = new HttpParams();

    if (filtres?.statut) {
      params = params.set('statut', filtres.statut);
    }
    if (filtres?.type) {
      params = params.set('type', filtres.type);
    }
    if (filtres?.dateDebut) {
      params = params.set('dateDebut', filtres.dateDebut);
    }
    if (filtres?.dateFin) {
      params = params.set('dateFin', filtres.dateFin);
    }

    return params;
  }

  exporterExcel(filtres?: FiltresRapport): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/excel`, {
      responseType: 'blob',
      params: this.construireParametres(filtres)
    });
  }

  exporterPdf(filtres?: FiltresRapport): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/pdf`, {
      responseType: 'blob',
      params: this.construireParametres(filtres)
    });
  }
}
