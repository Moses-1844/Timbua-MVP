import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { MaterialService } from '../../../core/services/material.service';

@Component({
  selector: 'app-supplier-sites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './supplier-sites.html',
  styleUrls: ['./supplier-sites.scss']
})
export class SupplierSites implements OnInit {
  supplierId!: string;
  sites: any[] = [];
  loading = true;

  constructor(private materialService: MaterialService) {}

  ngOnInit(): void {
    this.getSitesForSupplier();
  }

  getSitesForSupplier() {
    this.materialService.getSitesBySupplier('123').subscribe({
      next: (res) => {
        this.sites = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
