import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/listings" class="navbar-brand">
          <span class="brand-icon">M</span>
          <span>Meli Manager</span>
        </a>
        <div class="navbar-actions" *ngIf="auth.isLoggedIn()">
          <span class="user-name" *ngIf="auth.user()">
            Olá, {{ auth.user()?.nickname }}
          </span>
          <button class="btn-logout" (click)="auth.logout()">Sair</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #FFE600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      position: sticky; top: 0; z-index: 100;
    }
    .navbar-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 16px; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .navbar-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; color: #333; font-weight: 600; font-size: 16px;
    }
    .brand-icon {
      background: #3483FA; color: white;
      width: 32px; height: 32px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px;
    }
    .navbar-actions { display: flex; align-items: center; gap: 12px; }
    .user-name { font-size: 14px; color: #333; }
    .btn-logout {
      background: rgba(0,0,0,0.08); border: none;
      padding: 6px 14px; border-radius: 6px;
      font-size: 13px; cursor: pointer;
      &:hover { background: rgba(0,0,0,0.15); }
    }
  `]
})
export class NavbarComponent implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit() {
    if (this.auth.isLoggedIn() && !this.auth.user()) {
      this.auth.loadCurrentUser().subscribe({
        next: (user) => this.auth.user.set(user),
        error: () => this.auth.logout(),
      });
    }
  }
}