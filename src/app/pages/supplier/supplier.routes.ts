// src/app/pages/supplier/supplier.routes.ts
// import { Routes } from '@angular/router';
// import { SupplierLayout } from '../../layouts/supplier-layout/supplier-layout';
// import { Dashboard } from './dashboard/dashboard';
// import { AddMaterial } from './add-material/add-material';
// import { Quotations } from './quotations/quotations';

// export const SUPPLIER_ROUTES: Routes = [
//   {
//     path: '',
//     component: SupplierLayout,
//     children: [
//       { path: '', component: Dashboard },
//       { path: 'add-material', component: AddMaterial },
//       { path: 'quotations', component: Quotations },
//       { path: '**', redirectTo: '' }
//     ]
//   }
// ];
// src/app/pages/supplier/supplier.routes.ts
import { Routes } from '@angular/router';
import { SupplierLayout } from '../../layouts/supplier-layout/supplier-layout';

export const SUPPLIER_ROUTES: Routes = [
  {
    path: '',
    component: SupplierLayout ,
    children: [
      { 
        path: '', 
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) 
      },
      { 
        path: 'add-material', 
        loadComponent: () => import('./add-material/add-material').then(m => m.AddMaterial) 
      },
      { 
        path: 'quotations', 
        loadComponent: () => import('./quotations/quotations').then(m => m.Quotations) 
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders').then(m => m.Orders)
      },
      {
        path: 'supplier-sites',
        loadComponent: () => import('./supplier-sites/supplier-sites').then(m => m.SupplierSites)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then(m => m.Profile)
      },    
      { path: '**', redirectTo: '' }
    ]
  }
];