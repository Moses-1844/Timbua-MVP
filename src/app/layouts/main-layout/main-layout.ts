import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface Contractor {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  isVerified: boolean;
  registrationDate: string;
  verificationDate: string | null;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout implements OnInit {
  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  currentPageTitle = 'Dashboard';
  contractor: Contractor | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    console.log('MainLayout initialized');
    this.checkScreenSize();
    this.setupRouterEvents();
    this.loadContractorData();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        this.sidebarCollapsed = true;
        this.mobileSidebarOpen = false;
      }
    }
  }

  private setupRouterEvents() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
        if (isPlatformBrowser(this.platformId) && window.innerWidth < 1024) {
          this.mobileSidebarOpen = false;
        }
      });
  }

  private loadContractorData() {
    const contractorId = this.getContractorId();
    console.log('Loading contractor data for ID:', contractorId);

    this.http.get<Contractor>(`${environment.apiUrl}/contractors/${contractorId}`)
      .subscribe({
        next: (contractor) => {
          console.log('Contractor data loaded successfully:', contractor);
          this.contractor = contractor;
          this.loading = false;
          this.error = null;
        },
        error: (error) => {
          console.error('Error loading contractor data:', error);
          this.error = 'Failed to load contractor information. Please try again later.';
          this.loading = false;
        }
      });
  }

  private getContractorId(): number {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Server-side rendering, using test ID 1');
      return 1;
    }

    try {
      console.log('Looking for contractor ID in localStorage...');
      
      // Try multiple possible storage locations for contractor ID
      const storageKeys = [
        'currentUser',
        'contractorId', 
        'userId',
        'user',
        'contractor'
      ];

      for (const key of storageKeys) {
        const storedValue = localStorage.getItem(key);
        console.log(`Checking key "${key}":`, storedValue);
        
        if (storedValue) {
          try {
            const parsed = JSON.parse(storedValue);
            console.log(`Parsed ${key}:`, parsed);
            
            // Check for contractorId in parsed object
            if (parsed.contractorId) {
              const id = parseInt(parsed.contractorId, 10);
              console.log(`Found contractorId in ${key}:`, id);
              return id;
            }
            
            // Check for id in parsed object
            if (parsed.id) {
              const id = parseInt(parsed.id, 10);
              console.log(`Found id in ${key}:`, id);
              return id;
            }
          } catch (parseError) {
            console.log(`Key "${key}" is not JSON, trying direct parse`);
            // If it's not JSON, try to parse as direct ID
            const directId = parseInt(storedValue, 10);
            if (!isNaN(directId)) {
              console.log(`Found direct ID in ${key}:`, directId);
              return directId;
            }
          }
        }
      }

      // If no ID found in localStorage, use test ID 1
      console.log('No contractor ID found in localStorage. Using test ID: 1');
      return 1;
      
    } catch (error) {
      console.error('Error getting contractor ID from localStorage:', error);
      console.log('Using test ID: 1 due to parsing error');
      return 1;
    }
  }

  getContractorInitials(): string {
    if (!this.contractor?.contactPerson) {
      return 'CD';
    }
    
    const names = this.contractor.contactPerson.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.contractor.contactPerson.substring(0, 2).toUpperCase();
  }

  getContractorDisplayName(): string {
    return this.contractor?.contactPerson || 'Contractor';
  }

  getContractorStatus(): string {
    if (!this.contractor) return 'Loading...';
    
    switch (this.contractor.status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'Active';
      case 'PENDING':
        return 'Pending Approval';
      case 'REJECTED':
        return 'Rejected';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return this.contractor.status;
    }
  }

  getStatusBadgeClass(): string {
    if (!this.contractor) return 'loading';
    
    switch (this.contractor.status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'active';
      case 'PENDING':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      case 'INACTIVE':
        return 'inactive';
      default:
        return 'loading';
    }
  }

  isContractorVerified(): boolean {
    return this.contractor?.isVerified || false;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar() {
    if (isPlatformBrowser(this.platformId) && window.innerWidth < 1024) {
      this.mobileSidebarOpen = false;
    }
  }

  updatePageTitle() {
    const url = this.router.url;
    if (url.includes('construction-sites')) {
      this.currentPageTitle = 'Construction Sites';
    } else if (url.includes('orders')) {
      this.currentPageTitle = 'Orders';
    } else if (url.includes('quotations')) {
      this.currentPageTitle = 'Quotations';
    } else if (url.includes('assessments')) {
      this.currentPageTitle = 'Assessments';
    } else if (url.includes('materials')) {
      this.currentPageTitle = 'Materials';
    } else if (url.includes('add-site')) {
      this.currentPageTitle = 'Add New Site';
    } else if (url.includes('profile')) {
      this.currentPageTitle = 'Profile';
    } else {
      this.currentPageTitle = 'Dashboard';
    }
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  logout() {
    localStorage.clear();
    window.location.href = '/auth/login';
  }

  navigateToProfile() {
    this.router.navigate(['/contractor/profile']);
  }

  // Method to manually retry loading contractor data
  retryLoadContractorData() {
    this.loading = true;
    this.error = null;
    this.loadContractorData();
  }
}
/**
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface Contractor {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  isVerified: boolean;
  registrationDate: string;
  verificationDate: string | null;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout implements OnInit {
  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  currentPageTitle = 'Dashboard';
  contractor: Contractor | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.setupRouterEvents();
    this.loadContractorData();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        this.sidebarCollapsed = true;
        this.mobileSidebarOpen = false;
      }
    }
  }

  private setupRouterEvents() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
        if (window.innerWidth < 1024) {
          this.mobileSidebarOpen = false;
        }
      });
  }

  private loadContractorData() {
    const contractorId = this.getContractorId();
    
    if (!contractorId) {
      this.error = 'Unable to find your contractor account. Please log in again.';
      this.loading = false;
      return;
    }

    this.http.get<Contractor>(`${environment.apiUrl}/contractors/${contractorId}`)
      .subscribe({
        next: (contractor) => {
          this.contractor = contractor;
          this.loading = false;
          this.error = null;
        },
        error: (error) => {
          console.error('Error loading contractor data:', error);
          if (error.status === 404) {
            this.error = 'Contractor account not found. Please contact support.';
          } else if (error.status === 403) {
            this.error = 'Access denied. Please check your permissions.';
          } else {
            this.error = 'Failed to load contractor information. Please try again later.';
          }
          this.loading = false;
        }
      });
  }

  private getContractorId(): number | null {
    try {
      // Check multiple possible storage locations for contractor ID
      const storageKeys = [
        'currentUser',
        'contractorId', 
        'userId',
        'user',
        'contractor'
      ];

      for (const key of storageKeys) {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          try {
            const parsed = JSON.parse(storedValue);
            
            // Check for contractorId in parsed object
            if (parsed.contractorId) {
              return parseInt(parsed.contractorId, 10);
            }
            
            // Check for id in parsed object
            if (parsed.id) {
              return parseInt(parsed.id, 10);
            }
          } catch {
            // If it's not JSON, try to parse as direct ID
            const directId = parseInt(storedValue, 10);
            if (!isNaN(directId)) {
              return directId;
            }
          }
        }
      }

      console.warn('No contractor ID found in localStorage. Checked keys:', storageKeys);
      return null;
      
    } catch (error) {
      console.error('Error getting contractor ID from localStorage:', error);
      return null;
    }
  }

  getContractorInitials(): string {
    if (!this.contractor?.contactPerson) {
      return 'CD';
    }
    
    const names = this.contractor.contactPerson.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.contractor.contactPerson.substring(0, 2).toUpperCase();
  }

  getContractorDisplayName(): string {
    return this.contractor?.contactPerson || 'Contractor';
  }

  getContractorStatus(): string {
    if (!this.contractor) return 'Loading...';
    
    switch (this.contractor.status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'Active';
      case 'PENDING':
        return 'Pending Approval';
      case 'REJECTED':
        return 'Rejected';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return this.contractor.status;
    }
  }

  getStatusBadgeClass(): string {
    if (!this.contractor) return 'loading';
    
    switch (this.contractor.status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'active';
      case 'PENDING':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      case 'INACTIVE':
        return 'inactive';
      default:
        return 'loading';
    }
  }

  isContractorVerified(): boolean {
    return this.contractor?.isVerified || false;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar() {
    if (window.innerWidth < 1024) {
      this.mobileSidebarOpen = false;
    }
  }

  updatePageTitle() {
    const url = this.router.url;
    if (url.includes('construction-sites')) {
      this.currentPageTitle = 'Construction Sites';
    } else if (url.includes('orders')) {
      this.currentPageTitle = 'Orders';
    } else if (url.includes('quotations')) {
      this.currentPageTitle = 'Quotations';
    } else if (url.includes('assessments')) {
      this.currentPageTitle = 'Assessments';
    } else if (url.includes('materials')) {
      this.currentPageTitle = 'Materials';
    } else if (url.includes('add-site')) {
      this.currentPageTitle = 'Add New Site';
    } else {
      this.currentPageTitle = 'Dashboard';
    }
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  logout() {
    localStorage.clear();
    window.location.href = '/auth/login';
  }

  // Method to retry loading contractor data
  retryLoadContractorData() {
    this.loading = true;
    this.error = null;
    this.loadContractorData();
  }
}
*/