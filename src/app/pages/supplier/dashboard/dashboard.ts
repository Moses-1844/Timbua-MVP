import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimeAgoPipe } from './../../shared/pipes/time-ago.pipe';
import { SupplierService, Supplier, DashboardMetrics } from '../../../core/services/supplier.service';
import { MaterialService } from '../../../core/services/material.service';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  supplierId: number = 1; // This should come from auth service
  supplier: Supplier | null = null;
  loading = true;
  error = '';
  
  dashboardMetrics: DashboardMetrics = {
    activeSites: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    deliveriesToday: 0,
    averageRating: 0,
    totalReviews: 0
  };

  recentQuotes = [
    {
      id: 1,
      material: 'River Sand',
      quantity: 20,
      unit: 'tons',
      contractor: 'BuildRight Constructions',
      requestedDate: new Date('2024-01-20T10:30:00')
    },
    {
      id: 2,
      material: 'Quality Ballast',
      quantity: 50,
      unit: 'tons',
      contractor: 'Urban Developers Ltd',
      requestedDate: new Date('2024-01-20T14:20:00')
    }
  ];

  recentOrders = [
    {
      id: 1,
      material: 'Quality Ballast',
      status: 'in-transit',
      orderDate: new Date('2024-01-20T08:15:00')
    },
    {
      id: 2,
      material: 'River Sand',
      status: 'delivered',
      orderDate: new Date('2024-01-19T16:45:00')
    }
  ];

  activeSites = [
    {
      id: 1,
      name: 'Main Quarry Site',
      location: 'Kiambu Road, Nairobi',
      materialType: 'Ballast & Stones',
      availableCapacity: 1500,
      totalCapacity: 2000
    },
    {
      id: 2,
      name: 'Sand Mining Site',
      location: 'Athi River, Machakos',
      materialType: 'River Sand',
      availableCapacity: 800,
      totalCapacity: 1200
    }
  ];

  constructor(
    private supplierService: SupplierService,
    private materialService: MaterialService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = '';

    // Load supplier data
    this.supplierService.getSupplierById(this.supplierId).subscribe({
      next: (response) => {
        this.supplier = response.data;
        this.loadSupplierMaterials();
      },
      error: (err) => {
        console.error('Error loading supplier data:', err);
        this.error = 'Failed to load supplier information';
        this.loading = false;
      }
    });
  }

  loadSupplierMaterials() {
    // Load materials to calculate metrics
    this.materialService.getMaterialsBySupplier(this.supplierId.toString()).subscribe({
      next: (response) => {
        const materials = response.data || [];
        this.calculateDashboardMetrics(materials);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading materials:', err);
        this.calculateDashboardMetrics([]);
        this.loading = false;
      }
    });
  }

  calculateDashboardMetrics(materials: any[]) {
    // Calculate metrics based on materials data
    this.dashboardMetrics = {
      activeSites: materials.length,
      pendingQuotes: this.recentQuotes.length, // This would come from quotes API
      activeOrders: this.recentOrders.length, // This would come from orders API
      deliveriesToday: materials.filter(m => m.available).length, // Simplified
      averageRating: materials.length > 0 
        ? materials.reduce((sum, m) => sum + (m.rating || 0), 0) / materials.length 
        : 0,
      totalReviews: materials.reduce((sum, m) => sum + (m.totalReviews || 0), 0)
    };
  }

  getSupplierName(): string {
    return this.supplier?.companyName || 'Supplier';
  }

  get isVerified(): boolean {
    return this.supplier?.verified || false;
  }

  get verificationStatus(): string {
    if (!this.supplier) return 'Loading...';
    
    switch (this.supplier.status) {
      case 'APPROVED':
        return 'Verified';
      case 'PENDING':
        return 'Pending Verification';
      case 'REJECTED':
        return 'Verification Rejected';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return 'Unknown Status';
    }
  }

  getStatusClass(): string {
    if (!this.supplier) return '';
    
    switch (this.supplier.status) {
      case 'APPROVED':
        return 'active';
      case 'PENDING':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      case 'SUSPENDED':
        return 'suspended';
      default:
        return '';
    }
  }

  respondToQuote(quote: any) {
    console.log('Responding to quote:', quote);
    // this.router.navigate(['/supplier/quotations'], { queryParams: { quoteId: quote.id } });
  }

  viewActiveOrders() {
    console.log('Viewing active orders');
    // this.router.navigate(['/supplier/orders']);
  }

  refreshDashboard() {
    this.loadDashboardData();
  }
}