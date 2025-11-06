import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  supplier?: {
    id: number;
    companyName: string;
    businessRegistrationNumber: string;
    contactPerson: string;
    email: string;
    phone: string;
    website: string;
    description: string;
    yearsInBusiness: number;
    logoUrl: string;
    status: string;
    verificationDate: string;
    createdAt: string;
    updatedAt: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MaterialsResponse {
  data: Material[];
}

export interface MaterialResponse {
  data: Material;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = 'https://timbuabackend.onrender.com/api/materials';

  constructor(private http: HttpClient) {}

  // Get all materials
  getAllMaterials(): Observable<MaterialsResponse> {
    return this.http.get<MaterialsResponse>(this.apiUrl);
  }

  // Get materials by supplier ID
  getMaterialsBySupplier(supplierId: string): Observable<MaterialsResponse> {
    return this.http.get<MaterialsResponse>(`${this.apiUrl}/supplier/${supplierId}`);
  }

  // Get a single material by ID
  getMaterialById(materialId: number): Observable<MaterialResponse> {
    return this.http.get<MaterialResponse>(`${this.apiUrl}/${materialId}`);
  }

  // Add a new material for a supplier
  addMaterial(supplierId: number, materialData: any): Observable<MaterialResponse> {
    return this.http.post<MaterialResponse>(`${this.apiUrl}/supplier/${supplierId}`, materialData);
  }

  // Update a material
  updateMaterial(materialId: number, materialData: any): Observable<MaterialResponse> {
    return this.http.put<MaterialResponse>(`${this.apiUrl}/${materialId}`, materialData);
  }

  // Delete a material
  deleteMaterial(materialId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${materialId}`);
  }

  // Get sites by supplier (alias for getMaterialsBySupplier for backward compatibility)
  getSitesBySupplier(supplierId: string): Observable<MaterialsResponse> {
    return this.getMaterialsBySupplier(supplierId);
  }
}