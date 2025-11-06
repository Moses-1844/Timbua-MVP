import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationService, QuotationRequest, Quote, QuoteResponse } from '../../../core/services/quotation.service';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quotations.html',
  styleUrls: ['./quotations.scss']
})
export class Quotations implements OnInit {
  supplierId: number = 1; // This should come from auth service
  statusFilter = 'all';
  materialFilter = 'all';
  searchTerm = '';

  quotations: QuotationRequest[] = [];
  filteredQuotations: QuotationRequest[] = [];

  showResponseModal = false;
  selectedQuote: QuotationRequest | null = null;
  
  quoteResponse: QuoteResponse = {
    price: 0,
    currency: 'KSH',
    deliveryTime: '2-3',
    remarks: '',
    status: 'PENDING'
  };

  loading = true;
  error = '';

  constructor(private quotationService: QuotationService) {}

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    this.loading = true;
    this.error = '';

    this.quotationService.getQuotationRequests(this.supplierId).subscribe({
      next: (requests) => {
        this.quotations = this.enrichQuotationData(requests);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading quotations:', err);
        this.error = 'Failed to load quotation requests';
        this.loading = false;
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
  }

  private enrichQuotationData(requests: QuotationRequest[]): QuotationRequest[] {
    return requests.map(request => ({
      ...request,
      contractorName: request.contractor?.companyName || 'Unknown Contractor',
      projectName: `Project ${request.id}`,
      deliveryLocation: request.site?.location || 'Location not specified',
      distance: Math.floor(Math.random() * 50) + 5, // Mock distance
      estimatedDeliveryCost: Math.floor(Math.random() * 10000) + 5000, // Mock delivery cost
      requestedDate: request.requestedDate || new Date().toISOString()
    }));
  }

  private loadMockData() {
    // Fallback mock data with proper typing
    this.quotations = [
      {
        id: 1,
        materialId: 1,
        supplierId: this.supplierId,
        contractorId: 1,
        siteId: 1,
        material: 'Quality Ballast',
        quantity: 50,
        unit: 'tons',
        deadline: new Date('2024-01-25T23:59:59').toISOString(),
        status: 'PENDING',
        quotes: [],
        contractor: {
          id: 1,
          companyName: 'BuildRight Constructions',
          contactPerson: 'John Doe',
          email: 'john@buildright.com',
          phone: '+254712345678'
        },
        site: {
          id: 1,
          name: 'Downtown Site',
          location: 'Nairobi CBD',
          coordinates: { lat: -1.286389, lng: 36.817223 }
        },
        contractorName: 'BuildRight Constructions',
        projectName: 'Downtown Office Tower',
        deliveryLocation: 'Nairobi CBD',
        distance: 25,
        estimatedDeliveryCost: 12500,
        requestedDate: new Date('2024-01-20T10:30:00').toISOString()
      },
      {
        id: 2,
        materialId: 2,
        supplierId: this.supplierId,
        contractorId: 2,
        siteId: 2,
        material: 'River Sand',
        quantity: 30,
        unit: 'tons',
        deadline: new Date('2024-01-23T23:59:59').toISOString(),
        status: 'PENDING',
        quotes: [],
        contractor: {
          id: 2,
          companyName: 'Urban Developers Ltd',
          contactPerson: 'Jane Smith',
          email: 'jane@urbandev.com',
          phone: '+254723456789'
        },
        site: {
          id: 2,
          name: 'Westlands Site',
          location: 'Westlands, Nairobi',
          coordinates: { lat: -1.2583, lng: 36.8044 }
        },
        contractorName: 'Urban Developers Ltd',
        projectName: 'Residential Complex',
        deliveryLocation: 'Westlands',
        distance: 15,
        estimatedDeliveryCost: 8500,
        requestedDate: new Date('2024-01-19T14:20:00').toISOString()
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredQuotations = this.quotations.filter(quote => {
      const matchesStatus = this.statusFilter === 'all' || quote.status.toLowerCase() === this.statusFilter;
      const matchesMaterial = this.materialFilter === 'all' || 
                             quote.material.toLowerCase().includes(this.materialFilter.toLowerCase());
      const matchesSearch = !this.searchTerm || 
                           (quote.contractorName && quote.contractorName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                           (quote.projectName && quote.projectName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesStatus && matchesMaterial && matchesSearch;
    });
  }

  isUrgent(deadline: string): boolean {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff < 2;
  }

  openResponseModal(quote: QuotationRequest) {
    this.selectedQuote = quote;
    this.quoteResponse = {
      price: this.getSuggestedPrice(quote.material),
      currency: 'KSH',
      deliveryTime: '2-3',
      remarks: '',
      status: 'PENDING'
    };
    this.showResponseModal = true;
  }

  closeResponseModal() {
    this.showResponseModal = false;
    this.selectedQuote = null;
    this.quoteResponse = {
      price: 0,
      currency: 'KSH',
      deliveryTime: '2-3',
      remarks: '',
      status: 'PENDING'
    };
  }

  getSuggestedPrice(materialType: string): number {
    const prices: { [key: string]: number } = {
      'sand': 2500,
      'ballast': 1800,
      'murram': 1200,
      'stones': 2200,
      'quality ballast': 2000,
      'river sand': 2800,
      'building stones': 2400
    };
    
    const lowerMaterial = materialType.toLowerCase();
    for (const [key, price] of Object.entries(prices)) {
      if (lowerMaterial.includes(key)) {
        return price;
      }
    }
    return 2000;
  }

  calculateTotalPrice(): number {
    if (!this.selectedQuote) return 0;
    return this.quoteResponse.price * this.selectedQuote.quantity;
  }

  submitQuote() {
    if (!this.selectedQuote) return;

    this.quotationService.submitQuote(this.selectedQuote.id, this.quoteResponse).subscribe({
      next: (response) => {
        console.log('Quote submitted successfully:', response);
        
        // Update the local quotation status
        const index = this.quotations.findIndex(q => q.id === this.selectedQuote!.id);
        if (index !== -1) {
          this.quotations[index].status = 'ACCEPTED';
          this.quotations[index].quotes.push(response.id.toString());
        }
        
        this.closeResponseModal();
        this.applyFilters();
        alert('Quote submitted successfully!');
      },
      error: (err) => {
        console.error('Error submitting quote:', err);
        alert('Error submitting quote. Please try again.');
      }
    });
  }

  viewDetails(quote: QuotationRequest) {
    // Load detailed quote information
    this.quotationService.getQuotesByRequest(quote.id).subscribe({
      next: (quotes) => {
        console.log('Quote details:', quotes);
        // You can open a detailed view modal here
        this.openDetailedView(quote, quotes);
      },
      error: (err) => {
        console.error('Error loading quote details:', err);
      }
    });
  }

  private openDetailedView(quote: QuotationRequest, quotes: Quote[]) {
    // Implementation for detailed view modal
    console.log('Opening detailed view for:', quote);
    console.log('Associated quotes:', quotes);
    
    // You can implement a detailed modal here
    alert(`Detailed view for ${quote.material}\nTotal Quotes: ${quotes.length}`);
  }

  acceptQuote(quoteId: number) {
    this.quotationService.updateQuoteStatus(quoteId, 'ACCEPTED').subscribe({
      next: (response) => {
        console.log('Quote accepted:', response);
        this.updateLocalQuoteStatus(quoteId, 'ACCEPTED');
        alert('Quote accepted successfully!');
      },
      error: (err) => {
        console.error('Error accepting quote:', err);
        alert('Error accepting quote. Please try again.');
      }
    });
  }

  rejectQuote(quoteId: number) {
    this.quotationService.updateQuoteStatus(quoteId, 'REJECTED').subscribe({
      next: (response) => {
        console.log('Quote rejected:', response);
        this.updateLocalQuoteStatus(quoteId, 'REJECTED');
        alert('Quote rejected.');
      },
      error: (err) => {
        console.error('Error rejecting quote:', err);
        alert('Error rejecting quote. Please try again.');
      }
    });
  }

  createOrder(quote: QuotationRequest) {
    // Implementation to create order from accepted quote
    console.log('Creating order for quote:', quote);
    alert(`Creating order for ${quote.material} from ${quote.contractorName}`);
    // Navigate to order creation page or open order modal
  }

  private updateLocalQuoteStatus(quoteId: number, status: 'PENDING' | 'ACCEPTED' | 'REJECTED') {
    const requestIndex = this.quotations.findIndex(q => 
      q.quotes.includes(quoteId.toString())
    );
    if (requestIndex !== -1) {
      this.quotations[requestIndex].status = status;
      this.applyFilters();
    }
  }

  refreshQuotations() {
    this.loadQuotations();
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getContractorName(quote: QuotationRequest): string {
    return quote.contractorName || quote.contractor?.companyName || 'Unknown Contractor';
  }

  getProjectName(quote: QuotationRequest): string {
    return quote.projectName || `Project ${quote.id}`;
  }

  getDeliveryLocation(quote: QuotationRequest): string {
    return quote.deliveryLocation || quote.site?.location || 'Location not specified';
  }
}