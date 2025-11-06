
// src/app/layouts/supplier-layout/supplier-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-supplier-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './supplier-layout.html',
  styleUrls: ['./supplier-layout.scss']
})
export class SupplierLayout {
  constructor(private router: Router) {}

  isSidebarCollapsed = false;
  supplierName = 'Kenya Quarry Ltd';
  isVerified = true;

  menuItems = [
    {
      path: '/supplier',
      icon: 'dashboard',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/supplier/add-material',
      icon: 'add_circle',
      label: 'Add Material Site'
    },
    {
      path: '/supplier/quotations',
      icon: 'request_quote',
      label: 'Quotations'
    },
    {
      path: '/supplier/orders',
      icon: 'inventory',
      label: 'Orders'
    },
    {
      path: '/supplier/supplier-sites',
      icon: 'location_on',
      label: 'Material Sites'
    },
    {
      path: '/supplier/ratings',
      icon: 'star',
      label: 'Ratings & Reviews'
    }
  ];

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Log the action
    console.log('Logging out...');
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}