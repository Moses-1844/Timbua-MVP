// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { ConstructionSites } from './pages/contractor/construction-sites/construction-sites/construction-sites';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'contractor',
    loadChildren: () =>
      import('./pages/contractor/dashboard/dashboard.routes').then(m => m.CONTRACTOR_ROUTES)
  },
  {    
    path: 'construction-sites',
    loadComponent: () =>
      import('./pages/contractor/construction-sites/construction-sites/construction-sites').then(m => m.ConstructionSites)
  },
  {
    path: 'materials',
    loadComponent: () =>
      import('./pages/contractor/materials/materials').then(m => m.Materials)
  },
  {
    path: 'supplier',
    loadChildren: () =>
      import('./pages/supplier/supplier.routes').then(m => m.SUPPLIER_ROUTES) // Fixed path
  },
  {
    path: 'quotations',
    loadComponent: () =>
      import('./pages/contractor/quotations/quotations').then(m => m.Quotations)
  },
  {
    path: 'regulator',
    loadChildren: () =>
      import('./pages/regulator/dashboard/dashboard.routes').then(m => m.REGULATOR_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/dashboard/dashboard/dashboard.routes').then(m => m.ADMIN_ROUTES)
  },
  // fallback route
  { path: '**', redirectTo: '' },
];