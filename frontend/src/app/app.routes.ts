import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'listings', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent),
  },
  {
    path: 'auth/success',
    loadComponent: () => import('./pages/auth-success/auth-success.component')
      .then(m => m.AuthSuccessComponent),
  },
  {
    path: 'auth/error',
    loadComponent: () => import('./pages/auth-error/auth-error.component')
      .then(m => m.AuthErrorComponent),
  },
  {
    path: 'listings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/listings/listings.component')
      .then(m => m.ListingsComponent),
  },
  {
    path: 'listings/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/listings-form/listings-form.component')
      .then(m => m.ListingFormComponent),
  },
  {
    path: 'listings/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/listings-form/listings-form.component')
      .then(m => m.ListingFormComponent),
  },
  { path: '**', redirectTo: 'listings' },
];