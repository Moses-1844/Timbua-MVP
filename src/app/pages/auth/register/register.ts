import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ContractorRegistration {
  companyName: string;
  email: string;
  password: string;
  contactPerson: string;
  phoneNumber: string;
  businessRegistrationNumber: string;
  physicalAddress: string;
  specialization: string;
  yearsOfExperience: number;
  licenseNumber: string;
}

interface SupplierRegistration {
  companyName: string;
  businessRegistrationNumber: string;
  contactPerson: string;
  email: string;
  password: string;
  phone: string;
  website?: string;
  description?: string;
  yearsInBusiness: number;
  logoUrl?: string;
}

interface Role {
  value: 'contractor' | 'supplier';
  label: string;
  description: string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  // Basic user info
  user = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '' as 'contractor' | 'supplier'
  };

  // Contractor specific fields
  contractor = {
    companyName: '',
    businessRegistrationNumber: '',
    physicalAddress: '',
    specialization: '',
    yearsOfExperience: 0,
    licenseNumber: ''
  };

  // Supplier specific fields
  supplier = {
    companyName: '',
    businessRegistrationNumber: '',
    website: '',
    description: '',
    yearsInBusiness: 0,
    logoUrl: ''
  };

  isLoading = false;
  passwordMismatch = false;
  errorMessage = '';
  successMessage = '';

  roles: Role[] = [
    { value: 'contractor', label: 'Contractor', description: 'Manage construction projects and bids' },
    { value: 'supplier', label: 'Supplier', description: 'Provide construction materials and services' }
  ];

  specializations = [
    'Residential Buildings',
    'Commercial Buildings',
    'Road Construction',
    'Bridge Construction',
    'Renovation & Remodeling',
    'Electrical Works',
    'Plumbing Works',
    'General Construction',
    'Civil Engineering',
    'Architectural Design'
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  validatePassword(): boolean {
    this.passwordMismatch = this.user.password !== this.user.confirmPassword;
    return !this.passwordMismatch;
  }

  onRoleSelect(role: 'contractor' | 'supplier') {
    this.user.role = role;
    this.clearMessages();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFormValid(): boolean {
    if (!this.user.fullName || !this.user.email || !this.user.password || !this.user.phone || !this.user.role) {
      return false;
    }

    if (this.passwordMismatch) {
      return false;
    }

    if (this.user.role === 'contractor') {
      return !!(this.contractor.companyName && 
                this.contractor.businessRegistrationNumber && 
                this.contractor.physicalAddress && 
                this.contractor.specialization && 
                this.contractor.yearsOfExperience > 0 && 
                this.contractor.licenseNumber);
    }

    if (this.user.role === 'supplier') {
      return !!(this.supplier.companyName && 
                this.supplier.businessRegistrationNumber && 
                this.supplier.yearsInBusiness > 0);
    }

    return false;
  }

  onSubmit() {
    if (!this.validatePassword()) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    if (this.user.role === 'contractor') {
      this.registerContractor();
    } else if (this.user.role === 'supplier') {
      this.registerSupplier();
    }
  }

  private registerContractor() {
    const contractorData: ContractorRegistration = {
      companyName: this.contractor.companyName,
      email: this.user.email,
      password: this.user.password,
      contactPerson: this.user.fullName,
      phoneNumber: this.user.phone,
      businessRegistrationNumber: this.contractor.businessRegistrationNumber,
      physicalAddress: this.contractor.physicalAddress,
      specialization: this.contractor.specialization,
      yearsOfExperience: this.contractor.yearsOfExperience,
      licenseNumber: this.contractor.licenseNumber
    };

    this.http.post<any>(`${environment.apiUrl}/contractors/register`, contractorData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Contractor registration successful! Redirecting to login...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleRegistrationError(error, 'contractor');
        }
      });
  }

  private registerSupplier() {
    const supplierData: SupplierRegistration = {
      companyName: this.supplier.companyName,
      businessRegistrationNumber: this.supplier.businessRegistrationNumber,
      contactPerson: this.user.fullName,
      email: this.user.email,
      password: this.user.password,
      phone: this.user.phone,
      website: this.supplier.website,
      description: this.supplier.description,
      yearsInBusiness: this.supplier.yearsInBusiness,
      logoUrl: this.supplier.logoUrl
    };

    this.http.post<any>(`${environment.apiUrl}/suppliers/register`, supplierData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Supplier registration successful! Redirecting to login...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleRegistrationError(error, 'supplier');
        }
      });
  }

  private handleRegistrationError(error: any, role: string) {
    let errorMsg = `${role.charAt(0).toUpperCase() + role.slice(1)} registration failed. Please try again.`;
    
    if (error.status === 400) {
      errorMsg = 'Invalid data provided. Please check your information.';
    } else if (error.status === 409) {
      errorMsg = 'An account with this email already exists.';
    } else if (error.status === 0) {
      errorMsg = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.status >= 500) {
      errorMsg = 'Server error. Please try again later.';
    }
    this.errorMessage = errorMsg;
  }
}