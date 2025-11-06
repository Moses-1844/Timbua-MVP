import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MaterialService, Material } from '../add-material/material.service';

@Component({
  selector: 'app-supplier-sites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './supplier-sites.html',
  styleUrls: ['./supplier-sites.scss']
})
export class SupplierSites implements OnInit {
  supplierId: number | null = null;
  materials: Material[] = [];
  loading = true;
  error = '';

  displayedColumns = ['name', 'category', 'price', 'location', 'available', 'rating', 'actions'];

  constructor(private materialService: MaterialService) {}

  ngOnInit() {
    this.loadSupplierId();
  }

  /** Get supplier ID from localStorage */
  private loadSupplierId() {
    this.supplierId = this.materialService.getSupplierId();
    
    if (!this.supplierId) {
      this.error = 'Supplier information not found. Please log in again.';
      this.loading = false;
      console.error('No supplier ID found in localStorage');
      return;
    }

    console.log('Loaded supplier ID:', this.supplierId);
    this.loadMaterials();
  }

  /** Fetch materials for this supplier using backend API */
  private loadMaterials() {
    if (!this.supplierId) {
      this.error = 'Supplier ID not available';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.materialService.getSupplierMaterials(this.supplierId).subscribe({
      next: (response) => {
        console.log('Materials loaded successfully:', response);
        this.onMaterialsLoaded(response.data);
      },
      error: (error) => {
        console.error('Error fetching materials:', error);
        this.handleLoadError(error);
      }
    });
  }

  /** Fallback if supplier-specific API fails */
  private handleLoadError(error: any) {
    this.error = 'Failed to load materials. Trying alternative method...';

    // Try to get all materials and filter by supplier ID
    this.materialService.getAllMaterials().subscribe({
      next: (response) => {
        console.log('Fallback materials loaded:', response);
        if (response.data && this.supplierId) {
          this.materials = response.data.filter(m => 
            m.supplier?.id === this.supplierId || 
            m.supplier?.id?.toString() === this.supplierId?.toString()
          );
        } else {
          this.materials = [];
        }
        this.loading = false;
        
        if (this.materials.length === 0) {
          this.error = 'No materials found for your supplier account.';
        }
      },
      error: (err) => {
        console.error('Fallback also failed:', err);
        this.error = 'Unable to load materials. Please try again later.';
        this.loading = false;
        this.materials = [];
      }
    });
  }

  private onMaterialsLoaded(data: Material[]) {
    this.materials = data || [];
    this.loading = false;
    
    if (this.materials.length === 0) {
      this.error = 'No materials found. Add your first material site to get started.';
    }
    
    console.log('Materials loaded:', this.materials.length);
  }

  /** View helpers */
  getMaterialStatus = (m: Material) => (m.available ? 'Available' : 'Out of Stock');
  
  getStatusClass = (m: Material) => (m.available ? 'status-available' : 'status-unavailable');
  
  getCategoryIcon = (cat: string) => ({
    'Cement & Concrete': '🏗️',
    'Steel & Metal': '🔩',
    'Wood & Timber': '🪵',
    'Electrical': '⚡',
    'Plumbing': '🚰',
    'Finishing': '🎨',
    'Tools & Equipment': '🛠️'
  }[cat] || '📦');
  
  formatPrice = (m: Material) => {
    if (!m.price || !m.currency || !m.unit) return 'Price not set';
    return `${m.currency} ${m.price.toLocaleString()} / ${m.unit}`;
  };
  
  formatRating = (r: number) => (r > 0 ? r.toFixed(1) : 'No ratings');

  formatLocation = (m: Material) => {
    if (!m.location) return 'Location not set';
    // Truncate long location strings
    return m.location.length > 30 ? m.location.substring(0, 30) + '...' : m.location;
  };

  /** UI actions */
  onEditMaterial(m: Material) {
    console.log('Edit material:', m);
    // TODO: Navigate to edit page or open edit dialog
    // this.router.navigate(['/supplier/edit-material', m.id]);
  }

  onDeleteMaterial(m: Material) {
    if (!confirm(`Are you sure you want to delete "${m.name}"? This action cannot be undone.`)) return;
    
    this.materialService.deleteMaterial(m.id).subscribe({
      next: (response) => {
        console.log('Material deleted successfully:', response);
        this.materials = this.materials.filter(x => x.id !== m.id);
        // Show success message
        alert('Material deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting material:', error);
        let errorMessage = 'Error deleting material. Please try again.';
        if (error.status === 403) {
          errorMessage = 'Access denied. You do not have permission to delete this material.';
        } else if (error.status === 404) {
          errorMessage = 'Material not found. It may have already been deleted.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    });
  }

  toggleAvailability(m: Material) {
    const updatedMaterial = { 
      ...m, 
      available: !m.available 
    };

    // Remove supplier object if it exists to avoid circular references
    const { supplier, ...materialData } = updatedMaterial;

    this.materialService.updateMaterial(m.id, materialData).subscribe({
      next: (response) => {
        console.log('Material availability updated:', response);
        // Update local state
        m.available = !m.available;
        // Show success message
        const status = m.available ? 'available' : 'unavailable';
        alert(`Material marked as ${status}!`);
      },
      error: (error) => {
        console.error('Error updating material:', error);
        let errorMessage = 'Error updating material availability. Please try again.';
        if (error.status === 403) {
          errorMessage = 'Access denied. You do not have permission to update this material.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    });
  }

  refreshMaterials() {
    this.loadMaterials();
  }

  addNewMaterial() {
    // Navigate to add material page
    // this.router.navigate(['/supplier/add-material']);
    console.log('Navigate to add material page');
  }

  // Get statistics for the dashboard
  getMaterialStats() {
    return {
      total: this.materials.length,
      available: this.materials.filter(m => m.available).length,
      categories: [...new Set(this.materials.map(m => m.category))].length
    };
  }

  // Check if supplier ID is loaded
  isSupplierLoaded(): boolean {
    return this.supplierId !== null;
  }

  // Retry loading materials
  retryLoad() {
    this.error = '';
    this.loadMaterials();
  }
}