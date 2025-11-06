// Update the existing supplier-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SupplierService } from './supplier.service';

@Component({
  selector: 'app-supplier-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './supplier-layout.html',
  styleUrls: ['./supplier-layout.scss']
})
export class SupplierLayout implements OnInit {
  constructor(
    private router: Router,
    private supplierService: SupplierService
  ) {}

  isSidebarCollapsed = false;
  supplierName = 'Loading...';
  isVerified = false;

  menuItems = [
    {
      path: '/supplier',
      icon: 'dashboard',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/supplier/profile',
      icon: 'person',
      label: 'Profile'
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

  ngOnInit(): void {
    this.loadSupplierData();
  }

  loadSupplierData(): void {
    try {
      this.supplierService.getCurrentSupplier().subscribe({
        next: (response) => {
          const supplier = response.data;
          this.supplierName = supplier.companyName;
          this.isVerified = supplier.verified;
        },
        error: (error) => {
          console.error('Error loading supplier data:', error);
          this.supplierName = 'Supplier';
        }
      });
    } catch (error) {
      console.error('Error getting supplier ID:', error);
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}