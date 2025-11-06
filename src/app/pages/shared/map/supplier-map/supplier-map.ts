
import { Component, Input, Output, EventEmitter, OnDestroy, AfterViewInit, PLATFORM_ID, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SupplierMaterial, ConstructionSite } from '../../../../core/models/contractor.models';

@Component({
  selector: 'app-supplier-map',
  imports: [CommonModule],
  templateUrl: './supplier-map.html',
  styleUrl: './supplier-map.scss',
})
export class SupplierMap implements AfterViewInit, OnDestroy, OnChanges {
  @Input() materials: SupplierMaterial[] = [];
  @Input() selectedSite?: ConstructionSite;
  @Output() quoteRequested = new EventEmitter<SupplierMaterial>();

  private map: any;
  private L: any;
  mapInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  async ngAfterViewInit() {
    await this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['materials'] && this.mapInitialized) {
      this.plotMaterials();
    }
    if (changes['selectedSite'] && this.mapInitialized) {
      this.plotMaterials();
    }
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  private async initializeMap() {
    if (this.mapInitialized || !isPlatformBrowser(this.platformId)) return;

    try {
      this.L = await import('leaflet');
      
      setTimeout(() => {
        const mapElement = document.getElementById('supplierMap');
        if (!mapElement) return;

        this.map = this.L.map('supplierMap').setView([-1.2921, 36.8219], 7);

        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);

        this.L.control.scale().addTo(this.map);

        this.plotMaterials();
        this.mapInitialized = true;
      }, 100);
    } catch (error) {
      console.error('Failed to load Leaflet for supplier map:', error);
    }
  }

  private destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapInitialized = false;
      this.L = null;
    }
  }

  private plotMaterials() {
    if (!this.map || !this.L) return;

    // Clear existing markers
    this.map.eachLayer((layer: any) => {
      if (layer instanceof this.L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    // Add site marker if available
    if (this.selectedSite?.coordinates) {
      const siteMarker = this.L.marker([
        this.selectedSite.coordinates.lat, 
        this.selectedSite.coordinates.lng
      ], {
        icon: this.L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      }).addTo(this.map);

      siteMarker.bindPopup(`
        <div class="site-popup">
          <h6>Your Site: ${this.selectedSite.name}</h6>
          <p><strong>Location:</strong> ${this.selectedSite.location}</p>
        </div>
      `);
    }

    // Add material markers
    this.materials.forEach(material => {
      // Only add markers with valid coordinates
      if (!Array.isArray(material.supplierLocation) || 
          typeof material.supplierLocation[0] !== 'number' || 
          typeof material.supplierLocation[1] !== 'number') {
        return;
      }

      const marker = this.L.marker(material.supplierLocation, {
        icon: this.L.icon({
          iconUrl: this.getMaterialIcon(material.category),
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        })
      }).addTo(this.map);

      const popupContent = `
        <div class="material-popup">
          <h6>${material.name}</h6>
          <p><strong>Supplier:</strong> ${material.supplier}</p>
          <p><strong>Price:</strong> KSH ${this.formatCurrency(material.price)} / ${material.unit}</p>
          <p><strong>Distance:</strong> ${material.distance || 'N/A'} km</p>
          <p><strong>Rating:</strong> ${material.rating}/5</p>
          <p><strong>Delivery:</strong> ${material.deliveryTime}</p>
          <button class="btn btn-primary btn-sm w-100 mt-2 request-quote-btn" data-material-id="${material.id}">
            Request Quote
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click event for quote request
      marker.on('popupopen', () => {
        setTimeout(() => {
          const button = document.querySelector(`.request-quote-btn[data-material-id="${material.id}"]`);
          if (button) {
            button.addEventListener('click', () => {
              this.quoteRequested.emit(material);
              this.map.closePopup();
            });
          }
        }, 100);
      });
    });

    // Fit bounds to show all markers
    this.fitMapToMarkers();
  }

  private fitMapToMarkers() {
    if (!this.map || !this.L) return;

    const markers: any[] = [];

    // Add material markers with valid coordinates
    this.materials.forEach(material => {
      if (Array.isArray(material.supplierLocation) &&
          typeof material.supplierLocation[0] === 'number' &&
          typeof material.supplierLocation[1] === 'number') {
        markers.push(this.L.marker(material.supplierLocation));
      }
    });

    // Add site marker if available
    if (this.selectedSite?.coordinates) {
      markers.push(this.L.marker([
        this.selectedSite.coordinates.lat, 
        this.selectedSite.coordinates.lng
      ]));
    }

    if (markers.length > 0) {
      const group = new this.L.featureGroup(markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    } else {
      // Default to Kenya view if no markers
      this.map.setView([-1.2921, 36.8219], 7);
    }
  }

  private getMaterialIcon(category: string): string {
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

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Public method to refresh map if needed
  refreshMap(): void {
    if (this.mapInitialized) {
      this.plotMaterials();
    }
  }

  // Public method to set map view to specific coordinates
  setView(lat: number, lng: number, zoom: number = 12): void {
    if (this.map && this.L) {
      this.map.setView(this.L.latLng(lat, lng), zoom);
    }
  }
}