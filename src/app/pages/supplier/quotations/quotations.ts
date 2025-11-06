
// quotations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quotations',
  imports: [CommonModule, FormsModule],
  templateUrl: './quotations.html',
  styleUrl: './quotations.scss',
})
export class Quotations  implements OnInit {
  statusFilter = 'all';
  materialFilter = 'all';
  searchTerm = '';

  quotations = [
    {
      id: 1,
      contractorName: 'BuildRight Constructions',
      projectName: 'Downtown Office Tower',
      materialType: 'Quality Ballast',
      quantity: 50,
      unit: 'tons',
      deliveryLocation: 'Nairobi CBD',
      distance: 25,
      estimatedDeliveryCost: 12500,
      status: 'pending',
      deadline: new Date('2024-01-25T23:59:59'),
      requestedDate: new Date('2024-01-20T10:30:00')
    }
  ];

  filteredQuotations = [...this.quotations];

  showResponseModal = false;
  selectedQuote: any = null;
  
  quoteResponse = {
    unitPrice: 0,
    deliveryTime: '2-3',
    notes: '',
    includeDelivery: true
  };

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    // Implementation to load quotation requests from API
  }

  applyFilters() {
    this.filteredQuotations = this.quotations.filter(quote => {
      const matchesStatus = this.statusFilter === 'all' || quote.status === this.statusFilter;
      const matchesMaterial = this.materialFilter === 'all' || 
                             quote.materialType.toLowerCase().includes(this.materialFilter);
      const matchesSearch = !this.searchTerm || 
                           quote.contractorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           quote.projectName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesMaterial && matchesSearch;
    });
  }

  isUrgent(deadline: Date): boolean {
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff < 2;
  }

  openResponseModal(quote: any) {
    this.selectedQuote = quote;
    this.quoteResponse.unitPrice = this.getSuggestedPrice(quote.materialType);
    this.showResponseModal = true;
  }

  closeResponseModal() {
    this.showResponseModal = false;
    this.selectedQuote = null;
    this.quoteResponse = {
      unitPrice: 0,
      deliveryTime: '2-3',
      notes: '',
      includeDelivery: true
    };
  }

  getSuggestedPrice(materialType: string): number {
    const prices: { [key: string]: number } = {
      'sand': 2500,
      'ballast': 1800,
      'murram': 1200,
      'stones': 2200
    };
    return prices[materialType.toLowerCase()] || 2000;
  }

  calculateTotalPrice(): number {
    if (!this.selectedQuote) return 0;
    const basePrice = this.quoteResponse.unitPrice * this.selectedQuote.quantity;
    return this.quoteResponse.includeDelivery ? 
           basePrice + this.selectedQuote.estimatedDeliveryCost : basePrice;
  }

  submitQuote() {
    // Implementation to submit quote response
    console.log('Submitting quote:', this.quoteResponse);
    this.closeResponseModal();
    alert('Quote submitted successfully!');
  }

  viewDetails(quote: any) {
    // Implementation to view detailed quote information
    console.log('Viewing details for:', quote);
  }
}