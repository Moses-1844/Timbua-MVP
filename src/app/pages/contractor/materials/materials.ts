import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Material, SupplierMaterial, ConstructionSite } from '../../../core/models/contractor.models';

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

  // API endpoints
  private readonly API_BASE = 'http://localhost:3000';
  
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient
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
    this.http.get<Material[]>(`${this.API_BASE}/materials`)
      .subscribe({
        next: (materials) => {
          this.materials = materials;
          this.supplierMaterials = this.mapToSupplierMaterials(materials);
          // Initially show all materials without distance calculations
          this.filteredSupplierMaterials = [...this.supplierMaterials];
        },
        error: (error) => {
          console.error('Error loading materials:', error);
          this.initializeSampleMaterials();
        }
      });
  }

  loadConstructionSites() {
    this.http.get<ConstructionSite[]>(`${this.API_BASE}/sites?contractorId=${this.currentContractor.id}`)
      .subscribe({
        next: (sites) => {
          this.constructionSites = sites;
          // Don't auto-select a site initially
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
                           material.supplier.toLowerCase().includes(this.searchTerm.toLowerCase());
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
    
    // Initialize map immediately
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
          <p><strong>Price:</strong> KSH ${this.formatCurrency(material.price)} / ${material.unit}</p>
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
      this.quotationRequested.emit(originalMaterial);
    }
    this.showSupplierModal = false;
    
    setTimeout(() => {
      alert(`Quote request prepared for ${material.name} from ${material.supplier}`);
    }, 100);
  }

  onSiteSelect(event: any) {
    const siteId = parseInt(event.target.value);
    const site = this.constructionSites.find(s => s.id === siteId);
    
    if (site) {
      this.selectedSite = site;
      console.log('Site selected:', site.name);
      
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
      supplier: material.supplier,
      supplierLocation: [material.supplierCoordinates.lat, material.supplierCoordinates.lng],
      price: material.price,
      unit: material.unit,
      distance: 0, // Initialize with 0 distance
      rating: material.rating,
      contact: material.contact,
      deliveryTime: material.deliveryTime,
      minOrder: material.minOrder,
      currency: material.currency || 'KSH'
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
        name: 'Portland Cement',
        category: 'Cement & Concrete',
        supplier: 'BuildRight Supplies',
        supplierCoordinates: { lat: -1.2921, lng: 36.8219 },
        price: 6500,
        currency: 'KSH',
        unit: '50kg bag',
        location: 'Nairobi CBD',
        rating: 4.5,
        contact: '+254712345678',
        deliveryTime: '2-3 days',
        minOrder: 100,
        available: true
      },
      {
        id: 2,
        name: 'Reinforcement Steel Bars',
        category: 'Steel & Metal',
        supplier: 'SteelWorks Inc',
        supplierCoordinates: { lat: -1.2675, lng: 36.8060 },
        price: 850,
        currency: 'KSH',
        unit: 'kg',
        location: 'Industrial Area, Nairobi',
        rating: 4.2,
        contact: '+254723456789',
        deliveryTime: '1-2 days',
        minOrder: 500,
        available: true
      },
      {
        id: 3,
        name: 'Electrical Wires',
        category: 'Electrical',
        supplier: 'PowerTech Solutions',
        supplierCoordinates: { lat: -1.2800, lng: 36.8300 },
        price: 1200,
        currency: 'KSH',
        unit: 'meter',
        location: 'Eastleigh, Nairobi',
        rating: 4.7,
        contact: '+254734567890',
        deliveryTime: '1-3 days',
        minOrder: 100,
        available: true
      },
      {
        id: 4,
        name: 'PVC Pipes',
        category: 'Plumbing',
        supplier: 'PipeMasters Ltd',
        supplierCoordinates: { lat: -1.3000, lng: 36.8000 },
        price: 450,
        currency: 'KSH',
        unit: 'meter',
        location: 'Mombasa Road, Nairobi',
        rating: 4.3,
        contact: '+254745678901',
        deliveryTime: '2-4 days',
        minOrder: 50,
        available: true
      },
      {
        id: 5,
        name: 'Hardwood Timber',
        category: 'Wood & Timber',
        supplier: 'TimberTech Kenya',
        supplierCoordinates: { lat: -1.2500, lng: 36.8500 },
        price: 1800,
        currency: 'KSH',
        unit: 'cubic foot',
        location: 'Thika Road, Nairobi',
        rating: 4.6,
        contact: '+254756789012',
        deliveryTime: '3-5 days',
        minOrder: 20,
        available: true
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
        status: 'active',
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
        status: 'active',
        startDate: '2024-02-01',
        progress: 45,
        documents: ['site_plan.pdf', 'approvals.pdf'],
        contractorId: 1
      }
    ];
    // Don't auto-select a site initially
    this.selectedSite = null;
  }
}