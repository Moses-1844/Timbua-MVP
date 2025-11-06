import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QuotationService, QuotationRequest, CreateQuotationRequest, Quote, CreateQuoteRequest } from './quotation.service';
import { MaterialService, Material } from '../../../core/services/material.service';
import { ConstructionSiteService, ConstructionSite } from '../../../core/services/construction-site.service';

interface QuotationFormData {
  materialId: number;
  supplierId: number;
  material: string;
  quantity: number;
  unit: string;
  siteId: number;
  deadline: string;
}

@Component({
  selector: 'app-quotations',
  standalone: true,
  templateUrl: './quotations.html',
  styleUrls: ['./quotations.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    TitleCasePipe
  ],
  providers: [QuotationService, MaterialService, ConstructionSiteService] // Add providers here
})
export class Quotations implements OnInit {
  quotationRequests: QuotationRequest[] = [];
  materials: Material[] = [];
  constructionSites: ConstructionSite[] = [];
  quotationForm: FormGroup;
  showQuotationForm = false;
  showQuoteModal = false;
  selectedQuotation: QuotationRequest | null = null;
  quotes: Quote[] = [];

  // Current contractor
  currentContractor = {
    id: 1,
    name: 'John Contractor',
    email: 'john@contractor.com'
  };

  loading = true;
  error = '';

  // Quote form
  quoteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private materialService: MaterialService,
    private constructionSiteService: ConstructionSiteService
  ) {
    this.quotationForm = this.fb.group({
      materialId: ['', Validators.required],
      supplierId: ['', Validators.required],
      material: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      siteId: ['', Validators.required],
      deadline: ['', Validators.required]
    });

    this.quoteForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(0)]],
      currency: ['KSH', Validators.required],
      deliveryTime: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.loadQuotationRequests();
    this.loadMaterials();
    this.loadConstructionSites();
  }

  loadQuotationRequests() {
    this.loading = true;
    this.error = '';

    this.quotationService.getContractorQuotations(this.currentContractor.id)
      .subscribe({
        next: (quotations) => {
          this.quotationRequests = quotations;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading quotation requests:', error);
          this.error = 'Failed to load quotation requests';
          this.loading = false;
          this.loadSampleData();
        }
      });
  }

  loadMaterials() {
    this.materialService.getAllMaterials()
      .subscribe({
        next: (response) => {
          this.materials = response.data || [];
        },
        error: (error) => {
          console.error('Error loading materials:', error);
          this.initializeSampleMaterials();
        }
      });
  }

  loadConstructionSites() {
    this.constructionSiteService.getSitesByContractor(this.currentContractor.id)
      .subscribe({
        next: (sites) => {
          this.constructionSites = sites;
        },
        error: (error) => {
          console.error('Error loading construction sites:', error);
          this.initializeSampleSites();
        }
      });
  }

  openQuotationForm() {
    this.showQuotationForm = true;
    this.quotationForm.reset({
      currency: 'KSH',
      deadline: new Date().toISOString().split('T')[0]
    });
  }

  onMaterialSelect(event: any) {
    const materialId = parseInt(event.target.value);
    const selectedMaterial = this.materials.find(m => m.id === materialId);
    
    if (selectedMaterial) {
      this.quotationForm.patchValue({
        material: selectedMaterial.name,
        unit: selectedMaterial.unit,
        supplierId: selectedMaterial.supplier?.id || ''
      });
    }
  }

  submitQuotationRequest() {
    if (this.quotationForm.valid) {
      const formData = this.quotationForm.value;
      
      const quotationData: CreateQuotationRequest = {
        materialId: formData.materialId,
        supplierId: formData.supplierId,
        contractorId: this.currentContractor.id,
        siteId: formData.siteId,
        material: formData.material,
        quantity: formData.quantity,
        unit: formData.unit,
        deadline: formData.deadline,
        status: 'PENDING'
      };

      this.quotationService.createQuotation(quotationData)
        .subscribe({
          next: (newQuotation) => {
            this.quotationRequests.push(newQuotation);
            this.quotationForm.reset();
            this.showQuotationForm = false;
            alert('Quotation request submitted successfully!');
          },
          error: (error) => {
            console.error('Error submitting quotation request:', error);
            alert('Error submitting quotation request. Please try again.');
          }
        });
    }
  }

  viewQuotes(quotation: QuotationRequest) {
    this.selectedQuotation = quotation;
    this.quotationService.getQuotesByRequest(quotation.id)
      .subscribe({
        next: (quotes) => {
          this.quotes = quotes;
          this.showQuoteModal = true;
        },
        error: (error) => {
          console.error('Error loading quotes:', error);
          alert('Error loading quotes. Please try again.');
        }
      });
  }

  submitQuote() {
    if (this.quoteForm.valid && this.selectedQuotation) {
      const quoteData: CreateQuoteRequest = {
        price: this.quoteForm.value.price,
        currency: this.quoteForm.value.currency,
        deliveryTime: this.quoteForm.value.deliveryTime,
        remarks: this.quoteForm.value.remarks,
        status: 'PENDING'
      };

      this.quotationService.submitQuote(this.selectedQuotation.id, quoteData)
        .subscribe({
          next: (quote) => {
            this.quotes.push(quote);
            this.quoteForm.reset({
              currency: 'KSH'
            });
            alert('Quote submitted successfully!');
          },
          error: (error) => {
            console.error('Error submitting quote:', error);
            alert('Error submitting quote. Please try again.');
          }
        });
    }
  }

  updateQuotationStatus(quotation: QuotationRequest, status: 'PENDING' | 'RECEIVED' | 'ACCEPTED' | 'REJECTED') {
    this.quotationService.updateQuotationStatus(quotation.id, status)
      .subscribe({
        next: (updatedQuotation) => {
          const index = this.quotationRequests.findIndex(q => q.id === quotation.id);
          if (index !== -1) {
            this.quotationRequests[index] = updatedQuotation;
          }
          alert(`Quotation status updated to ${status}`);
        },
        error: (error) => {
          console.error('Error updating quotation status:', error);
          alert('Error updating quotation status. Please try again.');
        }
      });
  }

  updateQuoteStatus(quote: Quote, status: 'PENDING' | 'ACCEPTED' | 'REJECTED') {
    this.quotationService.updateQuoteStatus(quote.id, status)
      .subscribe({
        next: (updatedQuote) => {
          const quoteIndex = this.quotes.findIndex(q => q.id === quote.id);
          if (quoteIndex !== -1) {
            this.quotes[quoteIndex] = updatedQuote;
          }
          alert(`Quote status updated to ${status}`);
        },
        error: (error) => {
          console.error('Error updating quote status:', error);
          alert('Error updating quote status. Please try again.');
        }
      });
  }

  deleteQuotation(quotationId: number) {
    if (confirm('Are you sure you want to delete this quotation request?')) {
      // Note: Your API doesn't have a delete endpoint, so we'll just remove from local state
      this.quotationRequests = this.quotationRequests.filter(q => q.id !== quotationId);
      alert('Quotation request removed successfully!');
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'warning',
      'RECEIVED': 'info',
      'ACCEPTED': 'success',
      'REJECTED': 'danger'
    };
    return colors[status] || 'secondary';
  }

  getStatusDisplay(status: string): string {
    const displayMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'RECEIVED': 'Received',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected'
    };
    return displayMap[status] || status;
  }

  getSiteName(siteId: number): string {
    const site = this.constructionSites.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  }

  // Utility methods for deadline handling
  isDeadlineApproaching(deadline: string): boolean {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  getDaysRemaining(deadline: string): string {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  }

  // Sample data fallbacks
  private loadSampleData() {
    this.quotationRequests = [
      {
        id: 1,
        materialId: 1,
        supplierId: 1,
        contractorId: 1,
        siteId: 1,
        material: 'Portland Cement 50kg',
        quantity: 100,
        unit: 'bags',
        deadline: '2025-11-10',
        status: 'PENDING',
        quotes: []
      },
      {
        id: 2,
        materialId: 2,
        supplierId: 2,
        contractorId: 1,
        siteId: 2,
        material: 'TMT Steel Bars 12mm',
        quantity: 200,
        unit: 'kg',
        deadline: '2025-11-12',
        status: 'RECEIVED',
        quotes: ['1', '2']
      }
    ];
  }

  private initializeSampleMaterials() {
    this.materials = [
      {
        id: 1,
        name: 'Portland Cement 50kg',
        category: 'Cement & Concrete',
        price: 6500,
        currency: 'KSH',
        unit: 'bag',
        location: 'Nairobi CBD',
        rating: 4.5,
        contact: '+254712345678',
        deliveryTime: '2-3 days',
        minOrder: 100,
        available: true,
        supplierLat: -1.2921,
        supplierLng: 36.8219,
        supplier: {
          id: 1,
          companyName: 'Bamburi Cement Ltd',
          businessRegistrationNumber: 'CR123456',
          contactPerson: 'John Smith',
          email: 'sales@bamburi.com',
          phone: '+254712345678',
          website: 'https://bamburi.com',
          description: 'Leading cement manufacturer',
          yearsInBusiness: 50,
          logoUrl: '',
          status: 'APPROVED',
          verificationDate: '2024-01-01',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          verified: true
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private initializeSampleSites() {
    this.constructionSites = [
      {
        id: 1,
        name: 'Downtown Office Tower',
        location: 'Nairobi CBD',
        coordinates: { lat: -1.2921, lng: 36.8219 },
        type: 'Commercial',
        estimatedCost: 250000000,
        status: 'ACTIVE',
        startDate: '2024-01-15',
        progress: 65,
        documents: [],
        contractorId: 1
      },
      {
        id: 2,
        name: 'Westlands Residential Complex',
        location: 'Westlands, Nairobi',
        coordinates: { lat: -1.2675, lng: 36.8060 },
        type: 'Residential',
        estimatedCost: 150000000,
        status: 'ACTIVE',
        startDate: '2024-02-01',
        progress: 45,
        documents: [],
        contractorId: 1
      }
    ];
  }
}