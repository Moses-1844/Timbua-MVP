import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contractor {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Site {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  quotes: string[];
  contractor?: Contractor;
  site?: Site;
  requestedDate?: string;
  // Extended properties for UI
  contractorName?: string;
  projectName?: string;
  deliveryLocation?: string;
  distance?: number;
  estimatedDeliveryCost?: number;
}

export interface Quote {
  id: number;
  price: number;
  currency: string;
  deliveryTime: string;
  remarks: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  quotationRequest: QuotationRequest;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteResponse {
  price: number;
  currency: string;
  deliveryTime: string;
  remarks: string;
  status: 'PENDING';
}

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private apiUrl = 'https://timbuabackend.onrender.com/api/quotes';

  constructor(private http: HttpClient) {}

  // Get quotation requests for a supplier
  getQuotationRequests(supplierId: number): Observable<QuotationRequest[]> {
    return this.http.get<QuotationRequest[]>(`https://timbuabackend.onrender.com/api/quotation-requests/supplier/${supplierId}`);
  }

  // Get quotes for a specific quotation request
  getQuotesByRequest(quotationRequestId: number): Observable<Quote[]> {
    return this.http.get<Quote[]>(`${this.apiUrl}/request/${quotationRequestId}`);
  }

  // Submit a quote for a quotation request
  submitQuote(quotationRequestId: number, quoteData: QuoteResponse): Observable<Quote> {
    return this.http.post<Quote>(`${this.apiUrl}/${quotationRequestId}`, quoteData);
  }

  // Update quote status
  updateQuoteStatus(quoteId: number, status: 'PENDING' | 'ACCEPTED' | 'REJECTED'): Observable<Quote> {
    return this.http.put<Quote>(`${this.apiUrl}/${quoteId}/status?status=${status}`, {});
  }

  // Get quote by ID
  getQuoteById(quoteId: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/${quoteId}`);
  }
}