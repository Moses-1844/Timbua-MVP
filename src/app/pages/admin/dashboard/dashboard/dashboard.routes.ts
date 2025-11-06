import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    {
    path: '',
    loadComponent: () =>
    import('./dashboard').then(m => m.Dashboard)
    },
    {
    path: 'users',
    loadComponent: () =>
    import('../../users/users').then(m => m.Users)
    }
];
