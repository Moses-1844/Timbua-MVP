import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MaterialService, Material } from '../../../core/services/material.service';

interface MaterialSiteForm {
  id: number;
  supplierId: number;
  siteName: string;
  materialCategory: string;
  materialName: string;
  description: string;
  county: string;
  specificLocation: string;
  coordinates: { lat: number; lng: number };
  capacity: {
    total: number;
    available: number;
    unit: string;
  };
  pricing: {
    pricePerUnit: number;
    currency: string;
    unit: string;
    minOrder: number;
    deliveryCostPerKm: number;
  };
  delivery: {
    providesDelivery: boolean;
    maxRadius: number;
    averageTime: string;
    availableForRushDelivery: boolean;
  };
  licensing: {
    hasMiningLicense: boolean;
    licenseNumber?: string;
    licenseFiles: string[];
    isEnvironmentalCompliant: boolean;
    otherCertifications: string[];
  };
  specifications: {
    qualityGrade: string;
    size: string;
    color: string;
    brand: string;
    origin: string;
    additionalSpecs: any;
  };
  status: string;
  isVerified: boolean;
  rating: {
    average: number;
    totalReviews: number;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
  customMaterial?: string;
  supplierName: string;
  contact: string;
}

@Component({
  selector: 'app-add-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-material.html',
  styleUrls: ['./add-material.scss']
})
export class AddMaterial implements OnInit {
  materialSite: MaterialSiteForm = {
    id: 0,
    supplierId: 1, // This should come from auth service
    siteName: '',
    materialCategory: 'Cement & Concrete',
    materialName: '',
    description: '',
    county: '',
    specificLocation: '',
    coordinates: { lat: 0, lng: 0 },
    capacity: {
      total: 0,
      available: 0,
      unit: 'ton'
    },
    pricing: {
      pricePerUnit: 0,
      currency: 'KSH',
      unit: 'ton',
      minOrder: 0,
      deliveryCostPerKm: 0
    },
    delivery: {
      providesDelivery: false,
      maxRadius: 50,
      averageTime: '2-3',
      availableForRushDelivery: false
    },
    licensing: {
      hasMiningLicense: false,
      licenseFiles: [],
      isEnvironmentalCompliant: false,
      otherCertifications: []
    },
    specifications: {
      qualityGrade: '',
      size: '',
      color: '',
      brand: '',
      origin: '',
      additionalSpecs: {}
    },
    status: 'active',
    isVerified: false,
    rating: {
      average: 0,
      totalReviews: 0
    },
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customMaterial: '',
    supplierName: '',
    contact: ''
  };

  kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 
    'Machakos', 'Meru', 'Kiambu', 'Kilifi', 'Garissa', 'Kakamega',
    'Kisii', 'Nyeri', 'Embu', 'Narok', 'Kericho', 'Bungoma',
    'Busia', 'Homa Bay', 'Kajiado', 'Kilifi', 'Kirinyaga', 'Kitui',
    'Laikipia', 'Lamu', 'Mandera', 'Marsabit', 'Migori', 'Muranga',
    'Nyamira', 'Nyandarua', 'Nandi', 'Samburu', 'Siaya', 'Taita Taveta',
    'Tana River', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  materialCategories = [
    'Cement & Concrete',
    'Steel & Metal',
    'Wood & Timber',
    'Electrical',
    'Plumbing',
    'Finishing',
    'Tools & Equipment',
    'Other'
  ];

  unitTypes = ['ton', 'm3', 'kg', 'bag', 'piece', 'roll', 'sheet', 'lorry', 'unit'];
  deliveryTimes = ['1-2', '2-3', '3-5', '5-7', 'immediate'];

  showMapPreview = false;
  isSubmitting = false;
  licenseFiles: File[] = [];
  siteImages: File[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private materialService: MaterialService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    // Set default values
    this.materialSite.pricing.currency = 'KSH';
    this.materialSite.delivery.maxRadius = 50;
    this.materialSite.delivery.averageTime = '2-3';
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.materialSite.coordinates.lat = parseFloat(position.coords.latitude.toFixed(6));
          this.materialSite.coordinates.lng = parseFloat(position.coords.longitude.toFixed(6));
          this.showMapPreview = true;
          this.autoFillLocation(this.materialSite.coordinates.lat, this.materialSite.coordinates.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enable location services or enter coordinates manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please enter coordinates manually.');
    }
  }

  autoFillLocation(lat: number, lng: number) {
    // Simplified location detection - in real app, use reverse geocoding service
    if (lat > -1.5 && lat < -1.0 && lng > 36.7 && lng < 37.0) {
      this.materialSite.county = 'Nairobi';
      this.materialSite.specificLocation = 'Nairobi Area';
    }
  }

  onLicenseFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.licenseFiles.push(files[i]);
      }
      this.materialSite.licensing.licenseFiles = this.licenseFiles.map(file => file.name);
    }
  }

  onImageFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.siteImages.push(files[i]);
      }
      this.materialSite.images = this.siteImages.map(file => file.name);
    }
  }

  removeLicenseFile(index: number) {
    this.licenseFiles.splice(index, 1);
    this.materialSite.licensing.licenseFiles.splice(index, 1);
  }

  removeImageFile(index: number) {
    this.siteImages.splice(index, 1);
    this.materialSite.images.splice(index, 1);
  }

  validateForm(): boolean {
    if (!this.materialSite.siteName.trim()) {
      alert('Please enter a site name');
      return false;
    }

    if (!this.materialSite.materialName.trim()) {
      alert('Please enter a material name');
      return false;
    }

    if (this.materialSite.capacity.total <= 0) {
      alert('Please enter a valid total capacity');
      return false;
    }

    if (this.materialSite.capacity.available > this.materialSite.capacity.total) {
      alert('Available capacity cannot exceed total capacity');
      return false;
    }

    if (this.materialSite.pricing.pricePerUnit <= 0) {
      alert('Please enter a valid price per unit');
      return false;
    }

    if (!this.materialSite.county) {
      alert('Please select a county');
      return false;
    }

    if (!this.materialSite.specificLocation.trim()) {
      alert('Please enter a specific location');
      return false;
    }

    if (this.materialSite.coordinates.lat === 0 || this.materialSite.coordinates.lng === 0) {
      alert('Please set coordinates using current location or enter manually');
      return false;
    }

    if (!this.materialSite.supplierName.trim()) {
      alert('Please enter supplier name');
      return false;
    }

    if (!this.materialSite.contact.trim()) {
      alert('Please enter contact phone number');
      return false;
    }

    return true;
  }

  submitMaterialSite() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Handle custom material name
    if (this.materialSite.materialCategory === 'Other' && this.materialSite.customMaterial) {
      this.materialSite.materialName = this.materialSite.customMaterial;
    }

    // Prepare data according to API structure
    const materialData = {
      name: this.materialSite.materialName,
      category: this.materialSite.materialCategory,
      price: this.materialSite.pricing.pricePerUnit,
      currency: this.materialSite.pricing.currency,
      unit: this.materialSite.pricing.unit,
      location: `${this.materialSite.specificLocation}, ${this.materialSite.county}`,
      rating: 0, // Initial rating
      contact: this.materialSite.contact,
      deliveryTime: this.materialSite.delivery.averageTime,
      minOrder: this.materialSite.pricing.minOrder,
      available: this.materialSite.capacity.available > 0,
      supplierLat: this.materialSite.coordinates.lat,
      supplierLng: this.materialSite.coordinates.lng,
      description: this.materialSite.description || `Available ${this.materialSite.materialName} at ${this.materialSite.siteName}`
    };

    // Use the material service to submit data
    this.materialService.addMaterial(this.materialSite.supplierId, materialData)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Material site registered successfully:', response);
          alert('Material site registered successfully!');
          this.router.navigate(['/supplier/dashboard']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error registering material site:', error);
          alert('Error registering material site. Please try again.');
        }
      });
  }

  cancel() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/supplier/dashboard']);
    }
  }

  onTotalCapacityChange() {
    if (this.materialSite.capacity.available > this.materialSite.capacity.total) {
      this.materialSite.capacity.available = this.materialSite.capacity.total;
    }
  }

  resetForm() {
    if (confirm('Reset form? All entered data will be lost.')) {
      this.materialSite = {
        id: 0,
        supplierId: 1,
        siteName: '',
        materialCategory: 'Cement & Concrete',
        materialName: '',
        description: '',
        county: '',
        specificLocation: '',
        coordinates: { lat: 0, lng: 0 },
        capacity: {
          total: 0,
          available: 0,
          unit: 'ton'
        },
        pricing: {
          pricePerUnit: 0,
          currency: 'KSH',
          unit: 'ton',
          minOrder: 0,
          deliveryCostPerKm: 0
        },
        delivery: {
          providesDelivery: false,
          maxRadius: 50,
          averageTime: '2-3',
          availableForRushDelivery: false
        },
        licensing: {
          hasMiningLicense: false,
          licenseFiles: [],
          isEnvironmentalCompliant: false,
          otherCertifications: []
        },
        specifications: {
          qualityGrade: '',
          size: '',
          color: '',
          brand: '',
          origin: '',
          additionalSpecs: {}
        },
        status: 'active',
        isVerified: false,
        rating: {
          average: 0,
          totalReviews: 0
        },
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customMaterial: '',
        supplierName: '',
        contact: ''
      };
      this.licenseFiles = [];
      this.siteImages = [];
      this.showMapPreview = false;
    }
  }

  // Helper method to get unit label
  getUnitLabel(unit: string): string {
    const labels: { [key: string]: string } = {
      'ton': 'Ton',
      'm3': 'Cubic Meter',
      'kg': 'Kilogram',
      'bag': 'Bag',
      'piece': 'Piece',
      'roll': 'Roll',
      'sheet': 'Sheet',
      'lorry': 'Lorry',
      'unit': 'Unit'
    };
    return labels[unit] || unit;
  }
}