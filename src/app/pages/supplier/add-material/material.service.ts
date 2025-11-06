// src/app/core/services/material.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface Material {
  id: number;
  name: string;
  category: string;
  price: number;
  currency: string;
  unit: string;
  location: string;
  rating: number;
  contact: string;
  deliveryTime: string;
  minOrder: number;
  available: boolean;
  supplierLat: number;
  supplierLng: number;
  supplier?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  messageCode: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materials`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  // Get supplier ID from localStorage
  getSupplierId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Try different possible storage keys
        const possibleKeys = ['currentUser', 'user', 'authUser', 'supplier'];
        
        for (const key of possibleKeys) {
          const userData = localStorage.getItem(key);
          if (userData) {
            const user = JSON.parse(userData);
            const supplierId = user.id || user.supplierId || user.userId;
            if (supplierId) {
              console.log('Found supplier ID:', supplierId);
              return Number(supplierId);
            }
          }
        }
      } catch (error) {
        console.error('Error getting supplier ID from storage:', error);
      }
    }
    return null;
  }

  // Add material for a supplier
  addMaterial(supplierId: number, materialData: any): Observable<ApiResponse<Material>> {
    const url = `${this.apiUrl}/supplier/${supplierId}`;
    console.log('Adding material to:', url);
    return this.http.post<ApiResponse<Material>>(url, materialData);
  }

  // Get all materials for a supplier
  getSupplierMaterials(supplierId: number): Observable<ApiResponse<Material[]>> {
    const url = `${this.apiUrl}/supplier/${supplierId}`;
    return this.http.get<ApiResponse<Material[]>>(url);
  }

  // Update material
  updateMaterial(materialId: number, materialData: any): Observable<ApiResponse<Material>> {
    const url = `${this.apiUrl}/${materialId}`;
    return this.http.put<ApiResponse<Material>>(url, materialData);
  }

  // Delete material
  deleteMaterial(materialId: number): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${materialId}`;
    return this.http.delete<ApiResponse<string>>(url);
  }

  // Get all materials
  getAllMaterials(): Observable<ApiResponse<Material[]>> {
    return this.http.get<ApiResponse<Material[]>>(this.apiUrl);
  }
}