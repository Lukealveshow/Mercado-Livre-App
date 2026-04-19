import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loading = signal(false);
  error   = signal('');

  constructor(private auth: AuthService) {}

  login() {
    this.loading.set(true);
    this.error.set('');
    this.auth.getLoginUrl().subscribe({
      next: ({ url }) => window.location.href = url,
      error: () => {
        this.error.set('Não foi possível conectar ao servidor. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}