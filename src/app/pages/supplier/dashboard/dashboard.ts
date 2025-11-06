// supplier-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimeAgoPipe } from './../../shared/pipes/time-ago.pipe'; // Adjust path as needed

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe], // Add TimeAgoPipe here
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  supplierName = 'Kenya Quarry Ltd';
  isVerified = true;
  
  dashboardMetrics = {
    activeSites: 3,
    pendingQuotes: 5,
    activeOrders: 12,
    deliveriesToday: 3,
    averageRating: 4.2,
    totalReviews: 47
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

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Implementation to load dashboard data from API
    console.log('Loading dashboard data...');
  }

  respondToQuote(quote: any) {
    // Navigate to quotations page with pre-filled data
    console.log('Responding to quote:', quote);
    // this.router.navigate(['/supplier/quotations'], { queryParams: { quoteId: quote.id } });
  }

  viewActiveOrders() {
    // Navigate to orders management
    console.log('Viewing active orders');
    // this.router.navigate(['/supplier/orders']);
  }
}