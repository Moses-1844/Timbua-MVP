import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  verificationDate: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

export interface SupplierDocument {
  id: number;
  fileName: string;
  fileType: string;
  url: string;
  supplier: Supplier;
  uploadedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  messageCode: string;
  message: string;
}

export interface DashboardMetrics {
  activeSites: number;
  pendingQuotes: number;
  activeOrders: number;
  deliveriesToday: number;
  averageRating: number;
  totalReviews: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'https://timbuabackend.onrender.com/api/suppliers';

  constructor(private http: HttpClient) {}

  // Get supplier by ID
  getSupplierById(id: number): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`);
  }

  // Update supplier
  updateSupplier(id: number, supplierData: Partial<Supplier>): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, supplierData);
  }

  // Verify supplier
  verifySupplier(id: number, approve: boolean = true): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}/verify?approve=${approve}`, {});
  }

  // Get supplier documents
  getSupplierDocuments(supplierId: number): Observable<ApiResponse<SupplierDocument[]>> {
    return this.http.get<ApiResponse<SupplierDocument[]>>(`${this.apiUrl}/${supplierId}/documents`);
  }

  // Upload supplier document
  uploadDocument(supplierId: number, file: File): Observable<ApiResponse<SupplierDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<SupplierDocument>>(`${this.apiUrl}/${supplierId}/documents`, formData);
  }

  // Register new supplier
  registerSupplier(supplierData: Partial<Supplier>): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(`${this.apiUrl}/register`, supplierData);
  }

  // Register supplier with materials
  registerSupplierWithMaterials(supplierData: Partial<Supplier>): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(`${this.apiUrl}/register-with-materials`, supplierData);
  }

  // Get all suppliers
  getAllSuppliers(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(this.apiUrl);
  }

  // Get verified suppliers
  getVerifiedSuppliers(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(`${this.apiUrl}/verified`);
  }

  // Get dashboard metrics (you might need to create this endpoint)
  getDashboardMetrics(supplierId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${supplierId}/dashboard-metrics`);
  }
}