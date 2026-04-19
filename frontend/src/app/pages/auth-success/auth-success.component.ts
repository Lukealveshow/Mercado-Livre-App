import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-success',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:80vh">
      <p style="color:#555;font-size:16px">Autenticando, aguarde...</p>
    </div>
  `,
})
export class AuthSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.auth.saveToken(token);
      this.router.navigate(['/listings']);
    } else {
      this.router.navigate(['/auth/error']);
    }
  }
}