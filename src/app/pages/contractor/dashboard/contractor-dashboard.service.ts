import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface Contractor {
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
  isVerified: boolean;
  registrationDate: string;
  verificationDate: string;
}

export interface ConstructionSite {
  id: number;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  estimatedCost: number;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  progress: number;
  contractor: Contractor;
  documents: string[];
  contractorId: number;
}

export interface DashboardStats {
  activeProjects: number;
  pendingOrders: number;
  quotations: number;
  assessmentsDue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContractorDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  private getContractorId(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 1; // Default test ID for server-side
    }

    try {
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

      // If no ID found in localStorage, use test ID 1
      console.warn('No contractor ID found in localStorage. Using test ID: 1');
      return 1;
      
    } catch (error) {
      console.error('Error getting contractor ID from localStorage:', error);
      console.warn('Using test ID: 1 due to parsing error');
      return 1;
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  // Get contractor details
  getContractor(contractorId?: number): Observable<Contractor> {
    const id = contractorId || this.getContractorId();
    return this.http.get<Contractor>(`${this.apiUrl}/contractors/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Get all construction sites for the contractor
  getConstructionSites(contractorId?: number): Observable<ConstructionSite[]> {
    const id = contractorId || this.getContractorId();
    
    // For testing with ID 1, return mock data
    if (id === 1 && !environment.production) {
      return this.getMockConstructionSites();
    }

    return this.http.get<ConstructionSite[]>(`${this.apiUrl}/sites`, {
      headers: this.getHeaders()
    }).pipe(
      map(sites => sites.filter(site => site.contractorId === id))
    );
  }

  // Get construction site by ID
  getConstructionSite(id: number): Observable<ConstructionSite> {
    return this.http.get<ConstructionSite>(`${this.apiUrl}/sites/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Create new construction site
  createConstructionSite(site: Partial<ConstructionSite>): Observable<ConstructionSite> {
    const contractorId = this.getContractorId();
    const siteData = {
      ...site,
      contractorId: contractorId
    };
    return this.http.post<ConstructionSite>(`${this.apiUrl}/sites`, siteData, {
      headers: this.getHeaders()
    });
  }

  // Update construction site
  updateConstructionSite(id: number, site: Partial<ConstructionSite>): Observable<ConstructionSite> {
    return this.http.put<ConstructionSite>(`${this.apiUrl}/sites/${id}`, site, {
      headers: this.getHeaders()
    });
  }

  // Delete construction site
  deleteConstructionSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sites/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Get dashboard statistics
  getDashboardStats(contractorId?: number): Observable<DashboardStats> {
    const id = contractorId || this.getContractorId();
    
    // For testing with ID 1, return mock stats
    if (id === 1 && !environment.production) {
      return of({
        activeProjects: 3,
        pendingOrders: 2,
        quotations: 1,
        assessmentsDue: 1
      });
    }

    return this.getConstructionSites(id).pipe(
      map(sites => {
        const activeProjects = sites.filter(site => 
          site.status === 'PLANNING' || site.status === 'IN_PROGRESS'
        ).length;

        const pendingOrders = sites.filter(site => site.status === 'PLANNING').length;
        const quotations = sites.filter(site => site.status === 'PLANNING').length;
        const assessmentsDue = sites.filter(site => 
          new Date(site.endDate) > new Date() && site.progress < 100
        ).length;

        return {
          activeProjects,
          pendingOrders,
          quotations,
          assessmentsDue
        };
      })
    );
  }

  // Get recent projects (last 4 sites)
  getRecentProjects(contractorId?: number): Observable<ConstructionSite[]> {
    const id = contractorId || this.getContractorId();
    
    // For testing with ID 1, return mock recent projects
    if (id === 1 && !environment.production) {
      return this.getMockConstructionSites().pipe(
        map(sites => sites.slice(0, 4))
      );
    }

    return this.getConstructionSites(id).pipe(
      map(sites => sites.slice(0, 4))
    );
  }

  // Helper function to convert API status to component status
  mapApiStatusToComponentStatus(apiStatus: string): 'on-track' | 'delayed' | 'at-risk' {
    switch (apiStatus) {
      case 'IN_PROGRESS':
      case 'COMPLETED':
        return 'on-track';
      case 'ON_HOLD':
      case 'CANCELLED':
        return 'delayed';
      case 'PLANNING':
        return 'at-risk';
      default:
        return 'on-track';
    }
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Mock data for testing with ID 1
  private getMockConstructionSites(): Observable<ConstructionSite[]> {
    const mockSites: ConstructionSite[] = [
      {
        id: 1,
        name: 'Residential Complex - Phase 1',
        location: 'Nairobi West',
        coordinates: { lat: -1.3032, lng: 36.8267 },
        type: 'Residential',
        estimatedCost: 25000000,
        status: 'IN_PROGRESS',
        startDate: '2024-01-15',
        endDate: '2024-12-15',
        progress: 75,
        contractorId: 1,
        contractor: {
          id: 1,
          companyName: 'Demo Construction Ltd',
          email: 'demo@construction.com',
          contactPerson: 'John Doe',
          phoneNumber: '+254712345678',
          businessRegistrationNumber: 'REG123456',
          physicalAddress: '123 Construction Ave, Nairobi',
          specialization: 'Residential Buildings',
          yearsOfExperience: 8,
          licenseNumber: 'NCA-12345',
          status: 'ACTIVE',
          isVerified: true,
          registrationDate: '2023-01-15',
          verificationDate: '2023-01-20'
        },
        documents: []
      },
      {
        id: 2,
        name: 'Office Tower - Upper Hill',
        location: 'Upper Hill, Nairobi',
        coordinates: { lat: -1.2921, lng: 36.8219 },
        type: 'Commercial',
        estimatedCost: 150000000,
        status: 'PLANNING',
        startDate: '2024-03-01',
        endDate: '2025-06-30',
        progress: 15,
        contractorId: 1,
        contractor: {
          id: 1,
          companyName: 'Demo Construction Ltd',
          email: 'demo@construction.com',
          contactPerson: 'John Doe',
          phoneNumber: '+254712345678',
          businessRegistrationNumber: 'REG123456',
          physicalAddress: '123 Construction Ave, Nairobi',
          specialization: 'Residential Buildings',
          yearsOfExperience: 8,
          licenseNumber: 'NCA-12345',
          status: 'ACTIVE',
          isVerified: true,
          registrationDate: '2023-01-15',
          verificationDate: '2023-01-20'
        },
        documents: []
      },
      {
        id: 3,
        name: 'Shopping Mall - Thika Road',
        location: 'Thika Road, Nairobi',
        coordinates: { lat: -1.2076, lng: 36.9146 },
        type: 'Commercial',
        estimatedCost: 80000000,
        status: 'IN_PROGRESS',
        startDate: '2024-02-10',
        endDate: '2024-11-30',
        progress: 60,
        contractorId: 1,
        contractor: {
          id: 1,
          companyName: 'Demo Construction Ltd',
          email: 'demo@construction.com',
          contactPerson: 'John Doe',
          phoneNumber: '+254712345678',
          businessRegistrationNumber: 'REG123456',
          physicalAddress: '123 Construction Ave, Nairobi',
          specialization: 'Residential Buildings',
          yearsOfExperience: 8,
          licenseNumber: 'NCA-12345',
          status: 'ACTIVE',
          isVerified: true,
          registrationDate: '2023-01-15',
          verificationDate: '2023-01-20'
        },
        documents: []
      },
      {
        id: 4,
        name: 'Apartment Block - Kilimani',
        location: 'Kilimani, Nairobi',
        coordinates: { lat: -1.3005, lng: 36.7849 },
        type: 'Residential',
        estimatedCost: 45000000,
        status: 'ON_HOLD',
        startDate: '2023-11-01',
        endDate: '2024-08-31',
        progress: 45,
        contractorId: 1,
        contractor: {
          id: 1,
          companyName: 'Demo Construction Ltd',
          email: 'demo@construction.com',
          contactPerson: 'John Doe',
          phoneNumber: '+254712345678',
          businessRegistrationNumber: 'REG123456',
          physicalAddress: '123 Construction Ave, Nairobi',
          specialization: 'Residential Buildings',
          yearsOfExperience: 8,
          licenseNumber: 'NCA-12345',
          status: 'ACTIVE',
          isVerified: true,
          registrationDate: '2023-01-15',
          verificationDate: '2023-01-20'
        },
        documents: []
      },
      {
        id: 5,
        name: 'Community Center - Karen',
        location: 'Karen, Nairobi',
        coordinates: { lat: -1.3370, lng: 36.7081 },
        type: 'Institutional',
        estimatedCost: 35000000,
        status: 'COMPLETED',
        startDate: '2023-06-01',
        endDate: '2024-02-29',
        progress: 100,
        contractorId: 1,
        contractor: {
          id: 1,
          companyName: 'Demo Construction Ltd',
          email: 'demo@construction.com',
          contactPerson: 'John Doe',
          phoneNumber: '+254712345678',
          businessRegistrationNumber: 'REG123456',
          physicalAddress: '123 Construction Ave, Nairobi',
          specialization: 'Residential Buildings',
          yearsOfExperience: 8,
          licenseNumber: 'NCA-12345',
          status: 'ACTIVE',
          isVerified: true,
          registrationDate: '2023-01-15',
          verificationDate: '2023-01-20'
        },
        documents: []
      }
    ];

    return of(mockSites);
  }
}