import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'gcd_token';

interface JwtPayload {
  sub: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  readonly currentUserEmail = signal<string | null>(this.lireEmailDepuisToken());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          localStorage.setItem(TOKEN_KEY, response.token);
          this.currentUserEmail.set(this.lireEmailDepuisToken());
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserEmail.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const payload = this.decoderToken(this.getToken());

    if (!payload) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  private lireEmailDepuisToken(): string | null {
    const payload = this.decoderToken(this.getToken());
    return payload ? payload.sub : null;
  }

  private decoderToken(token: string | null): JwtPayload | null {

    if (!token) {
      return null;
    }

    try {
      const partiePayload = token.split('.')[1];
      const jsonPayload = atob(
        partiePayload.replace(/-/g, '+').replace(/_/g, '/')
      );
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      return null;
    }
  }
}
