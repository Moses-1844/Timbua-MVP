
import { Component, Output, EventEmitter, OnDestroy, AfterViewInit, PLATFORM_ID, Inject, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-site-location-map',
  imports: [CommonModule, FormsModule],
  templateUrl: './site-location-map.html',
  styleUrl: './site-location-map.scss',
})
export class SiteLocationMap implements AfterViewInit, OnDestroy {
  @Input() initialLocation: string = '';
  @Output() locationSelected = new EventEmitter<string>();

  private map: any;
  private L: any;
  private selectedMarker: any;
  mapInitialized = false;
  searchQuery: string = '';

  private readonly kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
    'Garissa', 'Kakamega', 'Embu', 'Nyeri', 'Machakos', 'Meru', 'Kilifi', 'Wajir'
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  async ngAfterViewInit() {
    await this.initializeMap();
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  private async initializeMap() {
    if (this.mapInitialized || !isPlatformBrowser(this.platformId)) return;

    try {
      this.L = await import('leaflet');
      
      setTimeout(() => {
        const mapElement = document.getElementById('siteLocationMap');
        if (!mapElement) return;

        this.map = this.L.map('siteLocationMap').setView([-1.2921, 36.8219], 7);

        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);

        this.L.control.scale().addTo(this.map);

        this.map.on('click', (e: any) => {
          this.placeMarker(e.latlng);
        });

        // If initial location is provided, set the marker
        if (this.initialLocation) {
          this.setMarkerFromLocation(this.initialLocation);
        }

        this.mapInitialized = true;
      }, 100);
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
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

  private placeMarker(latlng: any) {
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

    const location = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    this.locationSelected.emit(location);
    
    this.selectedMarker.bindPopup('Construction Site Location<br>Drag to adjust position').openPopup();

    this.selectedMarker.on('dragend', (event: any) => {
      const marker = event.target;
      const position = marker.getLatLng();
      const newLocation = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
      this.locationSelected.emit(newLocation);
    });
  }

  searchLocation() {
    if (!this.searchQuery.trim() || !this.L) return;

    const query = this.searchQuery.toLowerCase();
    const county = this.kenyanCounties.find(c => c.toLowerCase().includes(query));
    
    if (county) {
      const locations: { [key: string]: [number, number] } = {
        'nairobi': [-1.2921, 36.8219],
        'mombasa': [-4.0435, 39.6682],
        'kisumu': [-0.1022, 34.7617],
        'nakuru': [-0.3031, 36.0800],
        'eldoret': [0.5143, 35.2698],
        'thika': [-1.0333, 37.0833],
        'malindi': [-3.2176, 40.1164],
        'kitale': [1.0157, 34.9894],
        'garissa': [-0.4565, 39.6466],
        'kakamega': [0.2827, 34.7519],
        'embu': [-0.5390, 37.4574],
        'nyeri': [-0.4270, 36.9575],
        'machakos': [-1.5221, 37.2657],
        'meru': [0.0515, 37.6450],
        'kilifi': [-3.6333, 39.8500],
        'wajir': [1.7500, 40.0500]
      };

      const location = locations[county.toLowerCase()] || [-1.2921, 36.8219];
      this.map.setView(location, 12);
      this.placeMarker(this.L.latLng(location[0], location[1]));
    } else {
      this.geocodeLocation(this.searchQuery);
    }
  }

  private geocodeLocation(query: string) {
    if (!this.L) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Kenya')}&limit=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const latlng = this.L.latLng(parseFloat(result.lat), parseFloat(result.lon));
          this.map.setView(latlng, 14);
          this.placeMarker(latlng);
        } else {
          alert('Location not found. Please try a different search term.');
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
        alert('Error searching location. Please try again.');
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
      this.locationSelected.emit('');
    }
  }

  quickLocationSearch(location: string) {
    this.searchQuery = location;
    this.searchLocation();
  }

  private setMarkerFromLocation(location: string) {
    if (!this.L || !this.map) return;

    try {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        const latlng = this.L.latLng(lat, lng);
        this.map.setView(latlng, 14);
        this.placeMarker(latlng);
      }
    } catch (error) {
      console.error('Error setting marker from location:', error);
    }
  }

  // Public method to set location programmatically
  setLocation(lat: number, lng: number): void {
    if (this.L && this.map) {
      const latlng = this.L.latLng(lat, lng);
      this.map.setView(latlng, 14);
      this.placeMarker(latlng);
    }
  }

  // Public method to get current marker position
  getCurrentLocation(): string | null {
    if (this.selectedMarker) {
      const position = this.selectedMarker.getLatLng();
      return `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
    }
    return null;
  }

  // Public method to check if location is selected
  hasLocation(): boolean {
    return this.selectedMarker !== null;
  }
}