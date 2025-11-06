import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialService, Material, MaterialsResponse, QuoteRequest } from '../../../core/services/material.service';
import { ConstructionSiteService, ConstructionSite } from '../../../core/services/construction-site.service';

export interface SupplierMaterial {
  id: number;
  name: string;
  category: string;
  supplier: string;
  supplierLocation: [number, number];
  price: number;
  unit: string;
  distance: number;
  rating: number;
  contact: string;
  deliveryTime: string;
  minOrder: number;
  currency: string;
}

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.html',
  styleUrls: ['./materials.scss']
})
export class Materials implements OnInit, OnDestroy {
  @Input() materials: Material[] = [];
  @Output() materialSelected = new EventEmitter<Material>();
  @Output() quotationRequested = new EventEmitter<Material>();
  @Output() supplierModalOpened = new EventEmitter<void>();

  // Current contractor
  currentContractor = {
    id: 1,
    name: 'John Contractor',
    email: 'john@contractor.com'
  };

  constructionSites: ConstructionSite[] = [];
  
  searchTerm = '';
  materialCategoryFilter = 'all';
  showMaterialModal = false;
  showSupplierModal = false;
  selectedMaterial: Material | null = null;
  selectedSite: ConstructionSite | null = null;

  // Supplier Map properties
  private supplierMap: any;
  private supplierL: any;
  supplierMapInitialized = false;

  supplierMaterials: SupplierMaterial[] = [];
  filteredSupplierMaterials: SupplierMaterial[] = [];
  
  supplierFilters = {
    radius: 50,
    materialType: 'all',
    maxPrice: 1000000,
    minRating: 0,
    searchQuery: ''
  };

  materialCategories = [
    'all', 'Cement & Concrete', 'Steel & Metal', 'Wood & Timber', 
    'Electrical', 'Plumbing', 'Finishing', 'Tools & Equipment'
  ];

  loading = true;
  error = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private materialService: MaterialService,
    private constructionSiteService: ConstructionSiteService
  ) {}

  ngOnInit() {
    this.loadMaterials();
    this.loadConstructionSites();
  }

  ngOnDestroy() {
    this.destroySupplierMap();
  }

  // Data loading methods
  loadMaterials() {
    this.loading = true;
    this.error = '';

    this.materialService.getAllMaterials()
      .subscribe({
        next: (response: MaterialsResponse) => {
          this.materials = response.data || [];
          this.supplierMaterials = this.mapToSupplierMaterials(this.materials);
          this.filteredSupplierMaterials = [...this.supplierMaterials];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading materials:', error);
          this.error = 'Failed to load materials';
          this.loading = false;
          this.initializeSampleMaterials();
        }
      });
  }

  loadConstructionSites() {
    this.constructionSiteService.getSitesByContractor(this.currentContractor.id)
      .subscribe({
        next: (sites) => {
          this.constructionSites = sites;
          this.selectedSite = null;
        },
        error: (error) => {
          console.error('Error loading construction sites:', error);
          this.initializeSampleSites();
        }
      });
  }

  get filteredMaterials() {
    return this.materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           material.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.materialCategoryFilter === 'all' || material.category === this.materialCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  viewMaterialDetails(material: Material) {
    this.selectedMaterial = material;
    this.showMaterialModal = true;
  }

  requestQuotation(material: Material) {
    this.quotationRequested.emit(material);
  }

  // Supplier Modal Methods
  async openSupplierModal() {
    this.showSupplierModal = true;
    this.supplierModalOpened.emit();
    
    setTimeout(() => {
      this.initializeSupplierMap();
    }, 300);
  }

  private initializeSupplierMap() {
    if (this.supplierMapInitialized || !isPlatformBrowser(this.platformId)) return;

    import('leaflet').then(L => {
      this.supplierL = L;
      
      setTimeout(() => {
        const mapElement = document.getElementById('supplierMap');
        if (!mapElement) {
          console.error('Map element not found');
          return;
        }

        try {
          // Set initial view to Kenya
          this.supplierMap = L.map('supplierMap').setView([-1.2921, 36.8219], 7);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(this.supplierMap);

          L.control.scale().addTo(this.supplierMap);

          this.plotSupplierMaterials();
          this.supplierMapInitialized = true;
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }, 100);
    }).catch(error => {
      console.error('Failed to load Leaflet:', error);
    });
  }

  destroySupplierMap() {
    if (this.supplierMap) {
      this.supplierMap.remove();
      this.supplierMap = null;
      this.supplierMapInitialized = false;
      this.supplierL = null;
    }
  }

  calculateMaterialDistances(selectedSite: ConstructionSite) {
    if (!selectedSite?.coordinates) {
      return;
    }

    this.supplierMaterials = this.supplierMaterials.map(material => {
      const distance = this.calculateDistance(
        selectedSite.coordinates.lat,
        selectedSite.coordinates.lng,
        material.supplierLocation[0],
        material.supplierLocation[1]
      );
      return {
        ...material,
        distance: distance
      };
    });
  }

  plotSupplierMaterials() {
    if (!this.supplierMap || !this.supplierL) return;

    // Clear existing markers
    this.supplierMap.eachLayer((layer: any) => {
      if (layer instanceof this.supplierL.Marker) {
        this.supplierMap.removeLayer(layer);
      }
    });

    // Add site marker only if a site is selected
    if (this.selectedSite && this.selectedSite.coordinates) {
      const siteMarker = this.supplierL.marker(
        [this.selectedSite.coordinates.lat, this.selectedSite.coordinates.lng], 
        {
          icon: this.supplierL.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
          })
        }
      ).addTo(this.supplierMap);

      siteMarker.bindPopup(`
        <div class="site-popup">
          <h6>Your Site: ${this.selectedSite.name}</h6>
          <p><strong>Location:</strong> ${this.selectedSite.location}</p>
          <p><strong>Materials Nearby:</strong> ${this.filteredSupplierMaterials.length}</p>
        </div>
      `);
    }

    // Add material markers for filtered materials
    const materialMarkers: any[] = [];
    this.filteredSupplierMaterials.forEach(material => {
      const marker = this.supplierL.marker(material.supplierLocation, {
        icon: this.supplierL.icon({
          iconUrl: this.getMaterialIcon(material.category),
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        })
      }).addTo(this.supplierMap);

      const popupContent = `
        <div class="material-popup">
          <h6>${material.name}</h6>
          <p><strong>Supplier:</strong> ${material.supplier}</p>
          <p><strong>Price:</strong> ${material.currency} ${this.formatCurrency(material.price)} / ${material.unit}</p>
          ${material.distance ? `<p><strong>Distance:</strong> ${material.distance} km</p>` : ''}
          <p><strong>Rating:</strong> ${material.rating}/5</p>
          <p><strong>Delivery:</strong> ${material.deliveryTime}</p>
          <button class="btn btn-primary btn-sm w-100 mt-2 request-quote-btn">
            Request Quote
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click event for quote request
      marker.on('popupopen', () => {
        setTimeout(() => {
          const button = document.querySelector('.request-quote-btn');
          if (button) {
            button.addEventListener('click', () => {
              this.requestQuoteFromSupplier(material);
              this.supplierMap.closePopup();
            });
          }
        }, 100);
      });

      materialMarkers.push(marker);
    });

    // Fit map bounds to show all markers
    if (materialMarkers.length > 0) {
      const allMarkers = [...materialMarkers];
      
      // Add site marker to bounds if selected
      if (this.selectedSite && this.selectedSite.coordinates) {
        const siteMarker = this.supplierL.marker([
          this.selectedSite.coordinates.lat, 
          this.selectedSite.coordinates.lng
        ]);
        allMarkers.push(siteMarker);
      }
      
      const group = new this.supplierL.featureGroup(allMarkers);
      this.supplierMap.fitBounds(group.getBounds().pad(0.1));
    } else if (this.selectedSite && this.selectedSite.coordinates) {
      // If no materials but site is selected, center on site
      this.supplierMap.setView([this.selectedSite.coordinates.lat, this.selectedSite.coordinates.lng], 10);
    }
  }

  applySupplierFilters() {
    if (this.selectedSite) {
      // If site is selected, apply distance-based filtering
      this.filteredSupplierMaterials = this.supplierMaterials.filter(material => {
        // Distance filter (only apply if site is selected)
        if (this.supplierFilters.radius > 0 && material.distance && material.distance > this.supplierFilters.radius) {
          return false;
        }

        // Material type filter
        if (this.supplierFilters.materialType !== 'all' && 
            material.category !== this.supplierFilters.materialType) {
          return false;
        }

        // Price filter
        if (material.price > this.supplierFilters.maxPrice) {
          return false;
        }

        // Rating filter
        if (material.rating < this.supplierFilters.minRating) {
          return false;
        }

        // Search query filter
        if (this.supplierFilters.searchQuery && 
            !material.name.toLowerCase().includes(this.supplierFilters.searchQuery.toLowerCase()) &&
            !material.supplier.toLowerCase().includes(this.supplierFilters.searchQuery.toLowerCase())) {
          return false;
        }

        return true;
      });

      // Sort by distance (closest first) when site is selected
      this.filteredSupplierMaterials.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
      // If no site is selected, show all materials without distance filtering
      this.filteredSupplierMaterials = this.supplierMaterials.filter(material => {
        // Material type filter
        if (this.supplierFilters.materialType !== 'all' && 
            material.category !== this.supplierFilters.materialType) {
          return false;
        }

        // Price filter
        if (material.price > this.supplierFilters.maxPrice) {
          return false;
        }

        // Rating filter
        if (material.rating < this.supplierFilters.minRating) {
          return false;
        }

        // Search query filter
        if (this.supplierFilters.searchQuery && 
            !material.name.toLowerCase().includes(this.supplierFilters.searchQuery.toLowerCase()) &&
            !material.supplier.toLowerCase().includes(this.supplierFilters.searchQuery.toLowerCase())) {
          return false;
        }

        return true;
      });
    }

    // Update map if initialized
    if (this.supplierMapInitialized) {
      this.plotSupplierMaterials();
    }
  }

  resetSupplierFilters() {
    this.supplierFilters = {
      radius: 50,
      materialType: 'all',
      maxPrice: 1000000,
      minRating: 0,
      searchQuery: ''
    };
    this.applySupplierFilters();
  }

  requestQuoteFromSupplier(material: SupplierMaterial) {
    const originalMaterial = this.materials.find(m => m.id === material.id);
    if (originalMaterial) {
      this.submitQuotationRequest(originalMaterial);
    }
  }

  submitQuotationRequest(material: Material) {
    if (!this.selectedSite) {
      alert('Please select a construction site first.');
      return;
    }

    const quoteData: QuoteRequest = {
      price: material.price,
      currency: material.currency,
      deliveryTime: material.deliveryTime,
      remarks: `Request for ${material.name} at ${this.selectedSite.name}`,
      status: 'PENDING'
    };

    // In a real implementation, you would have a quotation request ID
    // For now, we'll simulate the API call
    this.materialService.submitQuote(1, quoteData).subscribe({
      next: () => {
        this.showSupplierModal = false;
        alert(`Quote request submitted for ${material.name} from ${material.supplier?.companyName || 'supplier'}`);
        this.quotationRequested.emit(material);
      },
      error: (error) => {
        console.error('Error submitting quote:', error);
        alert('Error submitting quote request. Please try again.');
      }
    });
  }

  onSiteSelect(event: any) {
    const siteId = parseInt(event.target.value);
    const site = this.constructionSites.find(s => s.id === siteId);
    
    if (site) {
      this.selectedSite = site;
      
      // Calculate distances for all materials from the selected site
      this.calculateMaterialDistances(site);
      
      // Apply filters with the new distances
      this.applySupplierFilters();
      
      // Re-center map on selected site
      if (this.supplierMap && site.coordinates) {
        this.supplierMap.setView([site.coordinates.lat, site.coordinates.lng], 10);
      }
    } else {
      // No site selected - reset to show all materials without distances
      this.selectedSite = null;
      this.supplierMaterials = this.supplierMaterials.map(material => ({
        ...material,
        distance: 0
      }));
      this.applySupplierFilters();
    }
  }

  onSupplierModalHide() {
    this.resetSupplierFilters();
    // Reset site selection when modal closes
    this.selectedSite = null;
    this.supplierMaterials = this.supplierMaterials.map(material => ({
      ...material,
      distance: 0
    }));
  }

  // Utility Methods
  private mapToSupplierMaterials(materials: Material[]): SupplierMaterial[] {
    return materials.map(material => ({
      id: material.id,
      name: material.name,
      category: material.category,
      supplier: material.supplier?.companyName || 'Unknown Supplier',
      supplierLocation: [material.supplierLat, material.supplierLng],
      price: material.price,
      unit: material.unit,
      distance: 0,
      rating: material.rating,
      contact: material.contact,
      deliveryTime: material.deliveryTime,
      minOrder: material.minOrder,
      currency: material.currency
    }));
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getMaterialIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Cement & Concrete': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      'Steel & Metal': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      'Wood & Timber': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      'Electrical': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      'Plumbing': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
      'Finishing': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-purple.png',
      'Tools & Equipment': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png'
    };
    return icons[category] || 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
  }

  getMaterialBadgeColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Cement & Concrete': 'success',
      'Steel & Metal': 'danger',
      'Wood & Timber': 'warning',
      'Electrical': 'primary',
      'Plumbing': 'info',
      'Finishing': 'purple',
      'Tools & Equipment': 'gold'
    };
    return colors[category] || 'secondary';
  }

  // Sample data fallbacks
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
          description: 'Leading cement manufacturer in Kenya',
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
      },
      {
        id: 2,
        name: 'TMT Steel Bars 12mm',
        category: 'Steel & Metal',
        price: 1200,
        currency: 'KSH',
        unit: 'piece',
        location: 'Industrial Area',
        rating: 4.3,
        contact: '+254723456789',
        deliveryTime: '1-2 days',
        minOrder: 50,
        available: true,
        supplierLat: -1.2675,
        supplierLng: 36.8060,
        supplier: {
          id: 2,
          companyName: 'Devki Steel Mills',
          businessRegistrationNumber: 'CR234567',
          contactPerson: 'Jane Doe',
          email: 'sales@devki.com',
          phone: '+254723456789',
          website: 'https://devki.com',
          description: 'Quality steel products manufacturer',
          yearsInBusiness: 25,
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
    this.supplierMaterials = this.mapToSupplierMaterials(this.materials);
    this.filteredSupplierMaterials = [...this.supplierMaterials];
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
        documents: ['site_plan.pdf', 'approvals.pdf'],
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
        documents: ['site_plan.pdf', 'approvals.pdf'],
        contractorId: 1
      }
    ];
    this.selectedSite = null;
  }
}