// src/app/services/supplier.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  role: string;
  verificationDate: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

export interface ApiResponse<T> {
  data: T;
  messageCode: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  private handleError(error: any) {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    if (error.status === 403) {
      errorMessage = 'Access denied. Please check your authentication.';
    } else if (error.status === 404) {
      errorMessage = 'Supplier not found.';
    } else if (error.status === 401) {
      errorMessage = 'Please log in again.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your connection.';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getSupplierById(id: number): Observable<ApiResponse<Supplier>> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Fetching supplier from:', url); // Debug log
    
    return this.http.get<ApiResponse<Supplier>>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateSupplier(id: number, supplier: Supplier): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, supplier)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCurrentSupplier(): Observable<ApiResponse<Supplier>> {
    const supplierId = this.getSupplierId();
    if (!supplierId) {
      return throwError(() => new Error('No supplier ID found. Please log in again.'));
    }
    return this.getSupplierById(supplierId);
  }

  getSupplierId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      // Check all possible storage locations and keys
      const storageTypes = [localStorage, sessionStorage];
      const possibleKeys = ['currentUser', 'user', 'authUser', 'supplier', 'loggedInUser'];
      
      for (const storage of storageTypes) {
        for (const key of possibleKeys) {
          try {
            const data = storage.getItem(key);
            if (data) {
              const user = JSON.parse(data);
              console.log('Found user data in storage:', { key, storage: storage === localStorage ? 'local' : 'session', user }); // Debug log
              
              // Try different ID property names
              const id = user.id || user.supplierId || user.userId || user.supplier?.id;
              if (id) {
                console.log('Found supplier ID:', id);
                return Number(id);
              }
            }
          } catch (e) {
            console.warn(`Error parsing storage key ${key}:`, e);
          }
        }
      }
    }
    
    console.warn('No supplier ID found in any storage location');
    return null;
  }

  // Get auth token from storage
  getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const tokenKeys = ['authToken', 'token', 'accessToken', 'jwtToken'];
      
      for (const key of tokenKeys) {
        const token = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (token) {
          console.log('Found auth token with key:', key);
          return token;
        }
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const hasId = this.getSupplierId() !== null;
    const hasToken = this.getAuthToken() !== null;
    console.log('Auth check - Has ID:', hasId, 'Has Token:', hasToken);
    return hasId && hasToken;
  }

  // Debug method to check storage contents
  debugStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('=== Storage Debug Info ===');
      console.log('LocalStorage contents:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          console.log(`  ${key}:`, localStorage.getItem(key));
        }
      }
      console.log('SessionStorage contents:');
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          console.log(`  ${key}:`, sessionStorage.getItem(key));
        }
      }
    }
  }
}