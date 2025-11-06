import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

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
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  endDate?: string;
  progress: number;
  contractorId: number;
  documents: string[];
}

export interface CreateSiteRequest {
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  estimatedCost: number;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  contractorId: number;
  documents?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConstructionSiteService {
  private apiUrl = `${environment.apiUrl}/sites`;

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

  // Get all construction sites
  getAllSites(): Observable<ConstructionSite[]> {
    return this.http.get<ConstructionSite[]>(this.apiUrl);
  }

  // Get construction site by ID
  getSiteById(id: number): Observable<ConstructionSite> {
    return this.http.get<ConstructionSite>(`${this.apiUrl}/${id}`);
  }

  // Get sites by contractor
  getSitesByContractor(contractorId?: number): Observable<ConstructionSite[]> {
    const id = contractorId || this.getContractorId();
    
    // For testing with ID 1, return mock data
    if (id === 1 && !environment.production) {
      return this.getMockSites();
    }

    return this.http.get<ConstructionSite[]>(`${this.apiUrl}?contractorId=${id}`);
  }

  // Create new construction site
  createSite(siteData: CreateSiteRequest): Observable<ConstructionSite> {
    // Ensure contractorId is set
    const dataWithContractor = {
      ...siteData,
      contractorId: siteData.contractorId || this.getContractorId()
    };
    
    return this.http.post<ConstructionSite>(this.apiUrl, dataWithContractor);
  }

  // Update construction site
  updateSite(id: number, siteData: Partial<ConstructionSite>): Observable<ConstructionSite> {
    return this.http.put<ConstructionSite>(`${this.apiUrl}/${id}`, siteData);
  }

  // Delete construction site
  deleteSite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Mock data for testing with ID 1
  private getMockSites(): Observable<ConstructionSite[]> {
    const mockSites: ConstructionSite[] = [
      {
        id: 1,
        name: 'Downtown Office Tower',
        location: 'Nairobi CBD',
        coordinates: { lat: -1.2921, lng: 36.8219 },
        type: 'Commercial',
        estimatedCost: 250000000,
        status: 'ACTIVE',
        startDate: '2024-01-15',
        progress: 65,
        documents: ['site_plan.pdf', 'approvals.pdf'],
        contractorId: 1
      },
      {
        id: 2,
        name: 'Riverside Apartments',
        location: 'Westlands, Nairobi',
        coordinates: { lat: -1.2675, lng: 36.8060 },
        type: 'Residential',
        estimatedCost: 180000000,
        status: 'PLANNING',
        startDate: '2024-02-01',
        progress: 15,
        documents: ['design_plan.pdf'],
        contractorId: 1
      },
      {
        id: 3,
        name: 'Shopping Mall - Thika Road',
        location: 'Thika Road, Nairobi',
        coordinates: { lat: -1.2076, lng: 36.9146 },
        type: 'Commercial',
        estimatedCost: 350000000,
        status: 'ACTIVE',
        startDate: '2024-01-20',
        progress: 40,
        documents: ['construction_plan.pdf'],
        contractorId: 1
      }
    ];

    return of(mockSites);
  }
}