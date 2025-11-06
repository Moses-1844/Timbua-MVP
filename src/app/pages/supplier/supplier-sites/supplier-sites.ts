import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MaterialService, Material } from '../../../core/services/material.service';

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
  supplierId = '1'; // normally comes from AuthService
  materials: Material[] = [];
  loading = true;
  error = '';

  displayedColumns = ['name', 'category', 'price', 'location', 'available', 'rating', 'actions'];

  constructor(private materialService: MaterialService) {}

  ngOnInit() {
    this.loadMaterials();
  }

  /** Fetch materials for this supplier */
  private loadMaterials() {
    this.loading = true;
    this.error = '';

    this.materialService.getMaterialsBySupplier(this.supplierId).subscribe({
      next: ({ data }) => this.onMaterialsLoaded(data),
      error: (err) => this.handleLoadError(err)
    });
  }

  /** Fallback if supplier API fails */
  private handleLoadError(error: any) {
    console.error('Error fetching materials:', error);
    this.error = 'Failed to load materials. Retrying...';

    this.materialService.getAllMaterials().subscribe({
      next: ({ data }) => {
        this.materials = data.filter(m => m.supplier?.id?.toString() === this.supplierId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Fallback failed:', err);
        this.error = 'Unable to load materials. Please try again.';
        this.loading = false;
      }
    });
  }

  private onMaterialsLoaded(data: Material[]) {
    this.materials = data || [];
    this.loading = false;
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
  formatPrice = (m: Material) => `${m.currency} ${m.price.toLocaleString()} / ${m.unit}`;
  formatRating = (r: number) => (r > 0 ? r.toFixed(1) : 'No ratings');

  /** UI actions */
  onEditMaterial(m: Material) {
    console.log('Edit material:', m);
    // TODO: Navigate or open edit dialog
  }

  onDeleteMaterial(m: Material) {
    if (!confirm(`Delete "${m.name}"?`)) return;
    this.materialService.deleteMaterial(m.id).subscribe({
      next: () => this.materials = this.materials.filter(x => x.id !== m.id),
      error: (err) => alert('Error deleting material. Please try again.')
    });
  }

  toggleAvailability(m: Material) {
    const updated = { ...m, available: !m.available };
    this.materialService.updateMaterial(m.id, updated).subscribe({
      next: ({ data }) => Object.assign(m, data),
      error: (err) => alert('Error updating material. Please try again.')
    });
  }

  refreshMaterials() {
    this.loadMaterials();
  }
}
