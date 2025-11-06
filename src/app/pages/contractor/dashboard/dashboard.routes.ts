import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { MainLayout } from '../../../layouts/main-layout/main-layout';

export const CONTRACTOR_ROUTES: Routes = [
    {
        path: '',
        component: MainLayout,   
        children: [
            {
    path: '',
    loadComponent: () =>
    import('./dashboard').then(m => m.Dashboard)
    },
    {
    path: 'add-site',
    loadComponent: () =>
    import('../add-site/add-site').then(m => m.AddSite)
    },
    {
    path: 'orders',
    loadComponent: () =>
    import('../orders/orders').then(m => m.Orders)
    },
    {
    path: 'quotations',
    loadComponent: () =>
    import('../quotations/quotations').then(m => m.Quotations)
    },
    {
        path: 'assessments',
        loadComponent: () =>
        import('../assessments/assessments').then(m => m.Assessments)
    },
    {
        path: 'materials',
        loadComponent: () =>
        import('../materials/materials').then(m => m.Materials)
    },
    {
        path: 'construction-sites',
        loadComponent: () =>
        import('../construction-sites/construction-sites/construction-sites').then(m => m.ConstructionSites)
    },
    {
        path: 'profile',
        loadComponent: () =>
        import('../profile/profile').then(m => m.Profile)
    }
        ]
    },
    
];
