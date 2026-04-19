import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  user = signal<any>(null);
  loading = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  getLoginUrl() {
    return this.http.get<{ url: string }>(`${this.api}/auth/login`);
  }

  saveToken(token: string) {
    localStorage.setItem('meli_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('meli_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  loadCurrentUser() {
    return this.http.get(`${this.api}/auth/me`);
  }

  logout() {
    localStorage.removeItem('meli_token');
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}