import { Routes } from '@angular/router';

export const SUPPLIER_ROUTES: Routes = [
    {
    path: '',
    loadComponent: () => import('./dashboard').then(m => m.Dashboard)
    },
    {
    path: 'add-material',
    loadComponent: () => import('../add-material/add-material').then(m => m.AddMaterial)
    },
    {
    path: 'quotations',
    loadComponent: () => import('../quotations/quotations').then(m => m.Quotations)
    }
];
