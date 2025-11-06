import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  role: 'CONTRACTOR' | 'SUPPLIER' | 'ADMIN' | 'REGULATOR';
  token: string;
  contractor?: {
    id: number;
    companyName: string;
    email: string;
    contactPerson: string;
    phoneNumber: string;
    businessRegistrationNumber: string;
    physicalAddress: string;
    specialization: string;
    yearsOfExperience: number;
    licenseNumber: string;
    status: string;
    role: string;
    isVerified: boolean;
    registrationDate: string;
    verificationDate: string;
    documents: any[];
    constructionSites: any[];
    quotationRequests: any[];
  };
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
    role: string;
    verificationDate: string;
    createdAt: string;
    updatedAt: string;
    verified: boolean;
  };
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private _isAuthenticated = false;
  private _role: string | null = null;
  private _userData: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  // Getters
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get role(): string | null {
    return this._role;
  }

  get userData(): any {
    return this._userData;
  }

  get token(): string | null {
    return localStorage.getItem('authToken');
  }

  // Login with backend API
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.handleSuccessfulLogin(response);
        } else {
          this.handleFailedLogin();
        }
      }),
      catchError(error => {
        this.handleFailedLogin();
        throw error;
      })
    );
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    this._isAuthenticated = true;
    this._role = response.role;

    // Save token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }

    // Save user data based on role
    let userData: any = {
      email: this.getEmailFromResponse(response),
      role: response.role
    };

    switch (response.role) {
      case 'CONTRACTOR':
        if (response.contractor) {
          userData = {
            ...userData,
            id: response.contractor.id,
            contractorId: response.contractor.id,
            companyName: response.contractor.companyName,
            contactPerson: response.contractor.contactPerson,
            isVerified: response.contractor.isVerified,
            status: response.contractor.status
          };
          // Save full contractor data
          localStorage.setItem('contractor', JSON.stringify(response.contractor));
        }
        break;

      case 'SUPPLIER':
        if (response.supplier) {
          userData = {
            ...userData,
            id: response.supplier.id,
            supplierId: response.supplier.id,
            companyName: response.supplier.companyName,
            contactPerson: response.supplier.contactPerson,
            verified: response.supplier.verified,
            status: response.supplier.status
          };
          // Save full supplier data
          localStorage.setItem('supplier', JSON.stringify(response.supplier));
        }
        break;

      case 'ADMIN':
        userData = {
          ...userData,
          id: 'admin',
          isAdmin: true
        };
        break;

      case 'REGULATOR':
        userData = {
          ...userData,
          id: 'regulator',
          isRegulator: true
        };
        break;
    }

    this._userData = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    console.log('Login successful:', { role: response.role, userData });
  }

  private getEmailFromResponse(response: LoginResponse): string {
    // Extract email from contractor or supplier data
    if (response.contractor) {
      return response.contractor.email;
    }
    if (response.supplier) {
      return response.supplier.email;
    }
    // For admin/regulator, we might need to get email from credentials
    return '';
  }

  private handleFailedLogin(): void {
    this._isAuthenticated = false;
    this._role = null;
    this._userData = null;
    this.clearLocalStorage();
  }

  // Logout with backend API
  logout(): Observable<LogoutResponse> {
    const token = this.token;
    this.clearSession();

    if (token) {
      return this.http.post<LogoutResponse>(`${this.apiUrl}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).pipe(
        tap(response => {
          console.log('Logout successful:', response.message);
          this.router.navigate(['/auth/login']);
        }),
        catchError(error => {
          console.error('Logout error:', error);
          // Even if API call fails, clear local session
          this.router.navigate(['/auth/login']);
          return of({ success: true, message: 'Logged out locally' });
        })
      );
    } else {
      this.router.navigate(['/auth/login']);
      return of({ success: true, message: 'Logged out locally' });
    }
  }

  // Clear session data
  private clearSession(): void {
    this._isAuthenticated = false;
    this._role = null;
    this._userData = null;
    this.clearLocalStorage();
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('contractor');
    localStorage.removeItem('supplier');
  }

  // Restore session from localStorage
  restoreSession(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this._isAuthenticated = true;
        this._role = user.role;
        this._userData = user;
        console.log('Session restored:', { role: user.role, user });
      } catch (error) {
        console.error('Error restoring session:', error);
        this.clearSession();
      }
    }
  }

  // Validate token with backend (optional)
  validateToken(): Observable<any> {
    const token = this.token;
    if (!token) {
      return of({ valid: false });
    }

    return this.http.get(`${this.apiUrl}/auth/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(response => {
        console.log('Token validation successful');
      }),
      catchError(error => {
        console.error('Token validation failed:', error);
        this.clearSession();
        throw error;
      })
    );
  }

  // Get current user ID based on role
  getCurrentUserId(): number | string | null {
    if (!this._userData) return null;

    switch (this._role) {
      case 'CONTRACTOR':
        return this._userData.contractorId || this._userData.id;
      case 'SUPPLIER':
        return this._userData.supplierId || this._userData.id;
      case 'ADMIN':
        return 'admin';
      case 'REGULATOR':
        return 'regulator';
      default:
        return null;
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this._role === role;
  }

  // Check if user is verified (for contractors/suppliers)
  isVerified(): boolean {
    if (!this._userData) return false;

    switch (this._role) {
      case 'CONTRACTOR':
        return this._userData.isVerified === true;
      case 'SUPPLIER':
        return this._userData.verified === true;
      default:
        return true; // Admin and regulator are considered verified
    }
  }

  // Get user's company name
  getCompanyName(): string {
    return this._userData?.companyName || '';
  }

  // Get user's contact person name
  getContactPerson(): string {
    return this._userData?.contactPerson || '';
  }
}