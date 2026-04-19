import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-error',
  standalone: true,
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;
                justify-content:center;min-height:80vh;gap:16px">
      <h2 style="color:#e74c3c">Falha na autenticação</h2>
      <p style="color:#666">Não foi possível conectar com o Mercado Livre.</p>
      <button class="btn-primary" (click)="router.navigate(['/login'])">
        Tentar novamente
      </button>
    </div>
  `,
})
export class AuthErrorComponent {
  constructor(public router: Router) {}
}