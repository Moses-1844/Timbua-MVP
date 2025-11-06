import { Routes } from '@angular/router';

export const REGULATOR_ROUTES: Routes = [
    {
    path: '',
    loadComponent: () => import('./dashboard').then(m => m.Dashboard)
    },
    {
    path: 'assessments',
    loadComponent: () => import('../assessments/assessments').then(m => m.Assessments)
    }
];
