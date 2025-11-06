// add-material.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  MaterialSite, 
  MaterialCategoryType, 
  MaterialUnitType, 
  DeliveryTimeType 
} from '../../../core/models/supplier.model';

@Component({
  selector: 'app-add-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-material.html',
  styleUrls: ['./add-material.scss']
})
export class AddMaterial implements OnInit {
  // Extended MaterialSite with additional form properties
  materialSite: MaterialSite & {
    customMaterial?: string;
    supplierName?: string;
    contact?: string;
  } = {
    id: 0,
    supplierId: 1, // This would come from auth service
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
    // Additional form properties
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

  materialCategories: MaterialCategoryType[] = [
    'Cement & Concrete',
    'Steel & Metal',
    'Wood & Timber',
    'Electrical',
    'Plumbing',
    'Finishing',
    'Tools & Equipment',
    'Other'
  ];

  unitTypes: MaterialUnitType[] = [
    'ton', 'm3', 'kg', 'bag', 'piece', 'roll', 'sheet', 'lorry', 'unit'
  ];

  deliveryTimes: DeliveryTimeType[] = [
    '1-2', '2-3', '3-5', '5-7', 'immediate'
  ];

  showMapPreview = false;
  isSubmitting = false;
  licenseFiles: File[] = [];
  siteImages: File[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
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
          
          // Auto-fill location based on coordinates (simplified)
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
    // Simplified location detection based on coordinates
    // In a real app, you would use a reverse geocoding service
    if (lat > -1.5 && lat < -1.0 && lng > 36.7 && lng < 37.0) {
      this.materialSite.county = 'Nairobi';
      this.materialSite.specificLocation = 'Nairobi Area';
    }
    // Add more location mappings as needed
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

  calculateTotalPrice(): number {
    const quantity = this.materialSite.capacity.available || 0;
    const unitPrice = this.materialSite.pricing.pricePerUnit || 0;
    return quantity * unitPrice;
  }

  validateForm(): boolean {
    // Basic validation
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

    // Create FormData for file uploads
    const formData = new FormData();
    
    // Prepare site data for submission
    const siteData = { ...this.materialSite };
    
    // Remove temporary form properties before submission
    delete (siteData as any).customMaterial;
    delete (siteData as any).supplierName;
    delete (siteData as any).contact;
    
    // Remove file arrays from JSON data (they'll be appended separately)
    delete (siteData as any).licenseFiles;
    delete (siteData as any).images;
    
    formData.append('siteData', JSON.stringify(siteData));
    
    // Append license files
    this.licenseFiles.forEach(file => {
      formData.append('licenseFiles', file);
    });
    
    // Append site images
    this.siteImages.forEach(file => {
      formData.append('siteImages', file);
    });

    // Simulate API call - replace with your actual API endpoint
    console.log('Submitting material site:', siteData);
    
    // For demo purposes, we'll simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      alert('Material site registered successfully!');
      this.router.navigate(['/supplier']);
    }, 2000);

    // Actual API call (commented out for now)
    /*
    this.http.post('/api/supplier/material-sites', formData)
      .subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          alert('Material site registered successfully!');
          this.router.navigate(['/supplier']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error registering material site:', error);
          alert('Error registering material site. Please try again.');
        }
      });
    */
  }

  cancel() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/supplier']);
    }
  }

  // Helper methods for template
  getCategoryIcon(category: MaterialCategoryType): string {
    const icons: Record<MaterialCategoryType, string> = {
      'Cement & Concrete': '🏗️',
      'Steel & Metal': '🔩',
      'Wood & Timber': '🪵',
      'Electrical': '⚡',
      'Plumbing': '🚰',
      'Finishing': '🎨',
      'Tools & Equipment': '🛠️',
      'Other': '📦'
    };
    return icons[category] || '📦';
  }

  getUnitLabel(unit: MaterialUnitType): string {
    const labels: Record<MaterialUnitType, string> = {
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

  // Auto-calculate available capacity when total changes
  onTotalCapacityChange() {
    if (this.materialSite.capacity.available > this.materialSite.capacity.total) {
      this.materialSite.capacity.available = this.materialSite.capacity.total;
    }
  }

  // Reset form to initial state
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
}