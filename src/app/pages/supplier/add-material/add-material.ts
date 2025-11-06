// src/app/pages/supplier/add-material/add-material.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MaterialService } from './material.service';
import { SupplierService } from '../../../core/services/supplier.service';

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
  @ViewChild('materialForm') materialForm!: NgForm;

  materialSite: MaterialSiteForm = {
    id: 0,
    supplierId: 0, // Will be set from localStorage
    siteName: '',
    materialCategory: '',
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
      unit: '',
      minOrder: 0,
      deliveryCostPerKm: 0
    },
    delivery: {
      providesDelivery: false,
      maxRadius: 50,
      averageTime: '',
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
  showDebug = true; // Set to false in production
  supplierData: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private materialService: MaterialService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSupplierData();
  }

  initializeForm() {
    // Set default values
    this.materialSite.pricing.currency = 'KSH';
    this.materialSite.delivery.maxRadius = 50;
  }

  loadSupplierData() {
    try {
      // Get supplier ID from service
      const supplierId = this.materialService.getSupplierId();
      
      if (!supplierId) {
        console.error('No supplier ID found in localStorage');
        alert('Please log in again to access this feature.');
        this.router.navigate(['/login']);
        return;
      }

      this.materialSite.supplierId = supplierId;
      console.log('Loaded supplier ID:', supplierId);

      // Load supplier details to pre-fill some fields
      this.supplierService.getCurrentSupplier().subscribe({
        next: (response) => {
          this.supplierData = response.data;
          this.materialSite.supplierName = this.supplierData.companyName;
          this.materialSite.contact = this.supplierData.phone;
          console.log('Supplier data loaded:', this.supplierData);
        },
        error: (error) => {
          console.error('Error loading supplier data:', error);
          // If we can't load supplier data, try to get from localStorage
          this.loadSupplierFromStorage();
        }
      });

    } catch (error) {
      console.error('Error initializing supplier data:', error);
      this.loadSupplierFromStorage();
    }
  }

  loadSupplierFromStorage() {
    try {
      const userData = localStorage.getItem('currentUser') || localStorage.getItem('supplier');
      if (userData) {
        const user = JSON.parse(userData);
        this.materialSite.supplierName = user.companyName || user.supplierName || '';
        this.materialSite.contact = user.phone || user.contact || '';
        console.log('Loaded supplier from storage:', user);
      }
    } catch (error) {
      console.error('Error loading supplier from storage:', error);
    }
  }

  // Check if all required fields are filled
  isFormValid(): boolean {
    const requiredFields = [
      this.materialSite.siteName,
      this.materialSite.materialCategory,
      this.materialSite.materialName,
      this.materialSite.county,
      this.materialSite.specificLocation,
      this.materialSite.supplierName,
      this.materialSite.contact,
      this.materialSite.pricing.unit
    ];

    const numericFields = [
      this.materialSite.capacity.total > 0,
      this.materialSite.capacity.available >= 0,
      this.materialSite.pricing.pricePerUnit > 0
    ];

    const coordinateFields = [
      this.materialSite.coordinates.lat !== 0,
      this.materialSite.coordinates.lng !== 0
    ];

    return requiredFields.every(field => field && field.toString().trim() !== '') &&
           numericFields.every(valid => valid) &&
           coordinateFields.every(valid => valid);
  }

  // Debug method to check required fields
  checkRequiredFields(): string {
    const fields = [
      { name: 'Site Name', value: this.materialSite.siteName },
      { name: 'Material Category', value: this.materialSite.materialCategory },
      { name: 'Material Name', value: this.materialSite.materialName },
      { name: 'County', value: this.materialSite.county },
      { name: 'Specific Location', value: this.materialSite.specificLocation },
      { name: 'Supplier Name', value: this.materialSite.supplierName },
      { name: 'Contact', value: this.materialSite.contact },
      { name: 'Unit', value: this.materialSite.pricing.unit },
      { name: 'Total Capacity', value: this.materialSite.capacity.total > 0 ? 'OK' : '' },
      { name: 'Price/Unit', value: this.materialSite.pricing.pricePerUnit > 0 ? 'OK' : '' },
      { name: 'Coordinates', value: (this.materialSite.coordinates.lat !== 0 && this.materialSite.coordinates.lng !== 0) ? 'OK' : '' },
      { name: 'Supplier ID', value: this.materialSite.supplierId ? 'OK' : '' }
    ];

    return fields.map(field => `${field.name}: ${field.value ? '✓' : '✗'}`).join(', ');
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

    if (!this.materialSite.materialCategory) {
      alert('Please select a material category');
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

    if (!this.materialSite.pricing.unit) {
      alert('Please select a unit');
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

    if (!this.materialSite.supplierId) {
      alert('Supplier information not found. Please log in again.');
      return false;
    }

    return true;
  }

  submitMaterialSite() {
    console.log('Submit button clicked');
    console.log('Form valid:', this.materialForm?.valid);
    console.log('Form values:', this.materialSite);

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
      description: this.materialSite.description || `Available ${this.materialSite.materialName} at ${this.materialSite.siteName}`,
      siteName: this.materialSite.siteName,
      supplierName: this.materialSite.supplierName
    };

    console.log('Submitting material data:', materialData);
    console.log('Supplier ID:', this.materialSite.supplierId);

    // Use the material service to submit data
    this.materialService.addMaterial(this.materialSite.supplierId, materialData)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Material site registered successfully:', response);
          alert('Material site registered successfully!');
          this.router.navigate(['/supplier/supplier-sites']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error registering material site:', error);
          
          let errorMessage = 'Error registering material site. Please try again.';
          if (error.status === 403) {
            errorMessage = 'Access denied. Please check your authentication.';
          } else if (error.status === 401) {
            errorMessage = 'Please log in again.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          alert(errorMessage);
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
        supplierId: this.materialSite.supplierId, // Keep the supplier ID
        siteName: '',
        materialCategory: '',
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
          unit: '',
          minOrder: 0,
          deliveryCostPerKm: 0
        },
        delivery: {
          providesDelivery: false,
          maxRadius: 50,
          averageTime: '',
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
        supplierName: this.materialSite.supplierName, // Keep supplier name
        contact: this.materialSite.contact // Keep contact
      };
      this.licenseFiles = [];
      this.siteImages = [];
      this.showMapPreview = false;
      
      // Reset form validation state
      if (this.materialForm) {
        this.materialForm.resetForm();
      }
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

  // Manual coordinate input
  onCoordinatesChange() {
    if (this.materialSite.coordinates.lat !== 0 && this.materialSite.coordinates.lng !== 0) {
      this.showMapPreview = true;
    }
  }
}