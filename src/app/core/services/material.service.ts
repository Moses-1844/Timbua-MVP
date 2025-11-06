import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** ---------- Interfaces ---------- **/

export interface Supplier {
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
}

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
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialsResponse {
  data: Material[];
}

export interface MaterialResponse {
  data: Material;
}

export interface QuoteRequest {
  price: number;
  currency: string;
  deliveryTime: string;
  remarks: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface QuotationRequest {
  id: number;
  materialId: number;
  supplierId: number;
  contractorId: number;
  siteId: number;
  material: string;
  quantity: number;
  unit: string;
  deadline: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  quotes: string[];
}

/** ---------- Service ---------- **/

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materials`;
  private quotesUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  /** -------- Materials -------- */

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

  // Alias (for backward compatibility)
  getSitesBySupplier(supplierId: string): Observable<MaterialsResponse> {
    return this.getMaterialsBySupplier(supplierId);
  }

  // Get materials by category
  getMaterialsByCategory(category: string): Observable<MaterialsResponse> {
    return this.http.get<MaterialsResponse>(`${this.apiUrl}?category=${category}`);
  }

  /** -------- Quotations -------- */

  // Submit a quote for a quotation request
  submitQuote(quotationRequestId: number, quoteData: QuoteRequest): Observable<any> {
    return this.http.post(`${this.quotesUrl}/${quotationRequestId}`, quoteData);
  }

  // Update quote status
  updateQuoteStatus(quoteId: number, status: string): Observable<any> {
    return this.http.put(`${this.quotesUrl}/${quoteId}/status?status=${status}`, {});
  }
}
