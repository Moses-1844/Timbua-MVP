import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConstructionSiteService, ConstructionSite, CreateSiteRequest } from '../../../../core/services/construction-site.service';
import { environment } from '../../../../../environments/environment';

interface ConstructionMaterial {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerUnit: number;
  unit: string;
  supplierName: string;
  supplierLocation: { lat: number; lng: number };
  supplierRating: number;
  distance: number;
  availableQuantity: number;
  minOrderQuantity: number;
  deliveryAvailable: boolean;
  deliveryCost: number;
}

@Component({
  selector: 'app-construction-sites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './construction-sites.html',
  styleUrls: ['./construction-sites.scss']
})
export class ConstructionSites implements OnInit, OnDestroy {
  @Input() sites: ConstructionSite[] = [];
  @Output() siteAdded = new EventEmitter<ConstructionSite>();
  @Output() dataExported = new EventEmitter<void>();

  // Current contractor
  currentContractor = {
    id: this.getContractorId(),
    name: 'John Contractor',
    email: 'john@contractor.com'
  };

  searchTerm = '';
  siteStatusFilter = 'all';
  showSiteModal = false;
  showLocationModal = false;
  showMaterialsModal = false;
  
  selectedSite: ConstructionSite | null = null;
  newSite: Partial<CreateSiteRequest> = {
    type: 'Commercial',
    status: 'PLANNING',
    contractorId: this.currentContractor.id
  };

  // Map properties
  private map: any;
  private viewMap: any;
  private L: any;
  private geocoder: any;
  selectedMarker: any;
  searchQuery: string = '';
  mapInitialized = false;

  // Material properties
  materials: ConstructionMaterial[] = [];
  filteredMaterials: ConstructionMaterial[] = [];
  materialTypeFilter = 'all';
  distanceFilter = '50';
  sortBy = 'distance';

  loading = true;
  error = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private constructionSiteService: ConstructionSiteService
  ) {}

  ngOnInit() {
    this.loadConstructionSites();
    this.loadMaterials();
  }

  ngOnDestroy() {
    this.destroyMap();
    this.destroyViewMap();
  }

  private getContractorId(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 1; // Default test ID for server-side
    }

    try {
      // Try multiple possible storage locations for contractor ID
      const storageKeys = [
        'currentUser',
        'contractorId', 
        'userId',
        'user',
        'contractor'
      ];

      for (const key of storageKeys) {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          try {
            const parsed = JSON.parse(storedValue);
            
            // Check for contractorId in parsed object
            if (parsed.contractorId) {
              return parseInt(parsed.contractorId, 10);
            }
            
            // Check for id in parsed object
            if (parsed.id) {
              return parseInt(parsed.id, 10);
            }
          } catch {
            // If it's not JSON, try to parse as direct ID
            const directId = parseInt(storedValue, 10);
            if (!isNaN(directId)) {
              return directId;
            }
          }
        }
      }

      // If no ID found in localStorage, use test ID 1
      console.warn('No contractor ID found in localStorage. Using test ID: 1');
      return 1;
      
    } catch (error) {
      console.error('Error getting contractor ID from localStorage:', error);
      console.warn('Using test ID: 1 due to parsing error');
      return 1;
    }
  }

  // Data loading methods
  loadConstructionSites() {
    this.loading = true;
    this.error = '';

    this.constructionSiteService.getSitesByContractor(this.currentContractor.id)
      .subscribe({
        next: (sites) => {
          this.sites = sites;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading construction sites:', error);
          this.error = 'Failed to load construction sites';
          this.loading = false;           
        }
      });
  }

  loadMaterials() {
    // Mock materials data - in real app, this would come from backend API
    this.materials = [
      {
        id: 1,
        name: 'Portland Cement 50kg',
        type: 'Cement & Concrete',
        description: 'High quality Portland cement for construction',
        pricePerUnit: 850,
        unit: 'bag',
        supplierName: 'Bamburi Cement Ltd',
        supplierLocation: { lat: -1.2921, lng: 36.8219 },
        supplierRating: 4.5,
        distance: 15,
        availableQuantity: 5000,
        minOrderQuantity: 100,
        deliveryAvailable: true,
        deliveryCost: 2000
      },
      {
        id: 2,
        name: 'TMT Steel Bars 12mm',
        type: 'Steel & Metal',
        description: 'Thermo-Mechanically Treated steel bars',
        pricePerUnit: 1200,
        unit: 'piece',
        supplierName: 'Devki Steel Mills',
        supplierLocation: { lat: -1.2675, lng: 36.8060 },
        supplierRating: 4.3,
        distance: 12,
        availableQuantity: 2000,
        minOrderQuantity: 50,
        deliveryAvailable: true,
        deliveryCost: 1500
      },
      {
        id: 3,
        name: 'Hardwood Timber 2x4',
        type: 'Wood & Timber',
        description: 'Quality hardwood timber for framing',
        pricePerUnit: 450,
        unit: 'piece',
        supplierName: 'Timber Solutions Kenya',
        supplierLocation: { lat: -1.3031, lng: 36.0800 },
        supplierRating: 4.2,
        distance: 25,
        availableQuantity: 800,
        minOrderQuantity: 20,
        deliveryAvailable: true,
        deliveryCost: 1800
      }
    ];
    this.filteredMaterials = [...this.materials];
  }

  get filteredSites() {
    return this.sites.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           site.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.siteStatusFilter === 'all' || 
                           site.status.toLowerCase() === this.siteStatusFilter.toLowerCase().replace('-', '_');
      return matchesSearch && matchesStatus;
    });
  }

  openAddSiteModal() {
    this.newSite = { 
      type: 'Commercial', 
      status: 'PLANNING',
      contractorId: this.currentContractor.id,
      startDate: new Date().toISOString().split('T')[0]
    };
    this.showSiteModal = true;
    
    setTimeout(() => {
      this.onModalShow();
    }, 100);
  }

  addNewSite() {
    if (!this.newSite.name || !this.newSite.location || !this.newSite.estimatedCost) {
      alert('Please fill all required fields.');
      return;
    }

    if (!this.newSite.coordinates) {
      alert('Please select a location on the map before adding the site.');
      return;
    }

    const siteData: CreateSiteRequest = {
      name: this.newSite.name!,
      location: this.newSite.location!,
      coordinates: this.newSite.coordinates!,
      type: this.newSite.type!,
      estimatedCost: this.newSite.estimatedCost!,
      status: this.newSite.status!,
      startDate: this.newSite.startDate!,
      contractorId: this.currentContractor.id,
      documents: []
    };

    this.constructionSiteService.createSite(siteData)
      .subscribe({
        next: (site) => {
          this.sites.push(site);
          this.showSiteModal = false;
          this.newSite = {};
          this.onModalHide();
          this.siteAdded.emit(site);
          alert('Construction site added successfully!');
        },
        error: (error) => {
          console.error('Error adding site:', error);
          alert('Error adding site. Please try again.');
        }
      });
  }

  updateSite(site: ConstructionSite) {
    this.constructionSiteService.updateSite(site.id, site)
      .subscribe({
        next: (updatedSite) => {
          const index = this.sites.findIndex(s => s.id === site.id);
          if (index !== -1) {
            this.sites[index] = updatedSite;
          }
          alert('Site updated successfully!');
        },
        error: (error) => {
          console.error('Error updating site:', error);
          alert('Error updating site. Please try again.');
        }
      });
  }

  deleteSite(siteId: number) {
    if (confirm('Are you sure you want to delete this construction site?')) {
      this.constructionSiteService.deleteSite(siteId)
        .subscribe({
          next: () => {
            this.sites = this.sites.filter(s => s.id !== siteId);
            alert('Site deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting site:', error);
            alert('Error deleting site. Please try again.');
          }
        });
    }
  }

  viewSiteLocation(site: ConstructionSite) {
    this.selectedSite = site;
    this.showLocationModal = true;
    
    setTimeout(() => {
      this.initializeViewMap();
    }, 100);
  }

  viewMaterials(site: ConstructionSite) {
    this.selectedSite = site;
    this.showMaterialsModal = true;
    this.calculateMaterialDistances();
    this.filterMaterials();
  }

  requestQuotation(material: ConstructionMaterial) {
    const quotationData = {
      materialId: material.id,
      materialName: material.name,
      siteId: this.selectedSite?.id,
      siteName: this.selectedSite?.name,
      supplierId: material.supplierName,
      quantity: material.minOrderQuantity,
      requestedDate: new Date().toISOString(),
      status: 'pending'
    };

    this.http.post(`${environment.apiUrl}/quotations`, quotationData)
      .subscribe({
        next: () => {
          alert('Quotation request sent successfully!');
        },
        error: (error) => {
          console.error('Error requesting quotation:', error);
          alert('Error sending quotation request. Please try again.');
        }
      });
  }

  exportData() {
    const headers = ['Name', 'Location', 'Type', 'Status', 'Estimated Cost', 'Progress', 'Start Date'];
    const csvData = this.sites.map(site => [
      site.name,
      site.location,
      site.type,
      this.getStatusDisplay(site.status),
      `KSH ${site.estimatedCost.toLocaleString()}`,
      `${site.progress}%`,
      new Date(site.startDate).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `construction-sites-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    this.dataExported.emit();
    alert('Data exported successfully!');
  }

  // Map Methods (same as before, but updated for API integration)
  async initializeMap() {
    if (this.mapInitialized || !isPlatformBrowser(this.platformId)) return;

    try {
      this.L = await import('leaflet');
      const geocoderModule = await import('leaflet-control-geocoder');
      this.geocoder = geocoderModule.Geocoder;
      
      setTimeout(() => {
        const mapElement = document.getElementById('siteLocationMap');
        if (!mapElement) return;

        this.map = this.L.map('siteLocationMap').setView([-1.2921, 36.8219], 10);

        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);

        // Add geocoder control
        this.L.Control.geocoder({
          defaultMarkGeocode: false,
          geocoder: new this.geocoder.Nominatim()
        })
        .on('markgeocode', (e: any) => {
          const bbox = e.geocode.bbox;
          this.map.fitBounds(bbox);
          this.placeMarker(e.geocode.center);
          this.newSite.location = e.geocode.name;
        })
        .addTo(this.map);

        this.map.on('click', (e: any) => {
          this.placeMarker(e.latlng);
          this.reverseGeocode(e.latlng);
        });

        this.mapInitialized = true;
      }, 100);
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
    }
  }

  async initializeViewMap() {
    if (!isPlatformBrowser(this.platformId) || !this.selectedSite) return;

    try {
      if (!this.L) {
        this.L = await import('leaflet');
      }

      setTimeout(() => {
        const mapElement = document.getElementById('viewLocationMap');
        if (!mapElement) return;

        this.viewMap = this.L.map('viewLocationMap').setView(
          [this.selectedSite!.coordinates.lat, this.selectedSite!.coordinates.lng], 
          15
        );

        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.viewMap);

        // Add site marker
        this.L.marker([this.selectedSite!.coordinates.lat, this.selectedSite!.coordinates.lng])
          .addTo(this.viewMap)
          .bindPopup(`
            <strong>${this.selectedSite!.name}</strong><br>
            ${this.selectedSite!.location}<br>
            Type: ${this.selectedSite!.type}<br>
            Status: ${this.getStatusDisplay(this.selectedSite!.status)}
          `)
          .openPopup();

        // Add material suppliers around the site
        this.materials.forEach(material => {
          const distance = this.calculateDistance(
            this.selectedSite!.coordinates.lat,
            this.selectedSite!.coordinates.lng,
            material.supplierLocation.lat,
            material.supplierLocation.lng
          );

          if (distance <= 100) { // Show suppliers within 100km
            this.L.marker([material.supplierLocation.lat, material.supplierLocation.lng], {
              icon: this.L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })
            })
            .addTo(this.viewMap)
            .bindPopup(`
              <strong>${material.supplierName}</strong><br>
              ${material.name}<br>
              Distance: ${distance.toFixed(1)} km<br>
              Price: KSH ${material.pricePerUnit}
            `);
          }
        });

      }, 100);
    } catch (error) {
      console.error('Failed to initialize view map:', error);
    }
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapInitialized = false;
    }
  }

  destroyViewMap() {
    if (this.viewMap) {
      this.viewMap.remove();
      this.viewMap = null;
    }
  }

  onModalShow() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.initializeMap();
    }, 300);
  }

  onModalHide() {
    this.clearMarker();
    this.searchQuery = '';
  }

  placeMarker(latlng: any) {
    if (!this.map || !this.L) return;

    if (this.selectedMarker) {
      this.map.removeLayer(this.selectedMarker);
    }

    this.selectedMarker = this.L.marker(latlng, {
      icon: this.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      draggable: true
    }).addTo(this.map);

    this.newSite.coordinates = { lat: latlng.lat, lng: latlng.lng };
    this.newSite.location = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    
    this.selectedMarker.bindPopup('Construction Site Location<br>Drag to adjust position').openPopup();

    this.selectedMarker.on('dragend', (event: any) => {
      const marker = event.target;
      const position = marker.getLatLng();
      this.newSite.coordinates = { lat: position.lat, lng: position.lng };
      this.newSite.location = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
      this.reverseGeocode(position);
    });
  }

  reverseGeocode(latlng: any) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          this.newSite.location = data.display_name;
        }
      })
      .catch(error => {
        console.error('Reverse geocoding error:', error);
      });
  }

  searchLocation() {
    if (!this.searchQuery.trim() || !this.L) return;

    const geocoder = new this.geocoder.Nominatim();
    geocoder.geocode(this.searchQuery + ', Kenya', (results: any) => {
      if (results && results.length > 0) {
        const result = results[0];
        this.map.setView(result.center, 14);
        this.placeMarker(result.center);
        this.newSite.location = result.name;
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  }

  useCurrentLocation() {
    if (!this.L || !isPlatformBrowser(this.platformId)) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = this.L.latLng(position.coords.latitude, position.coords.longitude);
          this.map.setView(latlng, 16);
          this.placeMarker(latlng);
          this.reverseGeocode(latlng);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get current location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  clearMarker() {
    if (this.selectedMarker && this.map) {
      this.map.removeLayer(this.selectedMarker);
      this.selectedMarker = null;
      this.newSite.location = '';
      this.newSite.coordinates = undefined;
    }
  }

  // Material Methods (same as before)
  calculateMaterialDistances() {
    if (!this.selectedSite) return;

    this.materials.forEach(material => {
      material.distance = this.calculateDistance(
        this.selectedSite!.coordinates.lat,
        this.selectedSite!.coordinates.lng,
        material.supplierLocation.lat,
        material.supplierLocation.lng
      );
    });
  }

  filterMaterials() {
    let filtered = [...this.materials];

    // Filter by type
    if (this.materialTypeFilter !== 'all') {
      filtered = filtered.filter(material => material.type === this.materialTypeFilter);
    }

    // Filter by distance
    if (this.distanceFilter !== 'all') {
      const maxDistance = parseInt(this.distanceFilter);
      filtered = filtered.filter(material => material.distance <= maxDistance);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return a.pricePerUnit - b.pricePerUnit;
        case 'rating':
          return b.supplierRating - a.supplierRating;
        default:
          return 0;
      }
    });

    this.filteredMaterials = filtered;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Utility Methods
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': 'success',
      'PLANNING': 'info',
      'COMPLETED': 'secondary',
      'ON_HOLD': 'warning'
    };
    return colors[status] || 'secondary';
  }

  getStatusDisplay(status: string): string {
    const displayMap: { [key: string]: string } = {
      'PLANNING': 'Planning',
      'ACTIVE': 'Active',
      'COMPLETED': 'Completed',
      'ON_HOLD': 'On Hold'
    };
    return displayMap[status] || status;
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'danger';
    if (progress < 70) return 'warning';
    return 'success';
  }

  getMaterialTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Cement & Concrete': 'success',
      'Steel & Metal': 'danger',
      'Wood & Timber': 'warning',
      'Electrical': 'primary',
      'Plumbing': 'info',
      'Finishing': 'purple',
      'Tools & Equipment': 'gold'
    };
    return colors[type] || 'secondary';
  }

  // Sample data fallback
  
}