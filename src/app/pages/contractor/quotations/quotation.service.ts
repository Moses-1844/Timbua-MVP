import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  status: 'PENDING' | 'RECEIVED' | 'ACCEPTED' | 'REJECTED';
  quotes: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuotationRequest {
  materialId: number;
  supplierId: number;
  contractorId: number;
  siteId: number;
  material: string;
  quantity: number;
  unit: string;
  deadline: string;
  status: 'PENDING';
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

export interface CreateQuoteRequest {
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
  private apiUrl = `${environment.apiUrl}/quotations`;
  private quotesUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  // Get all quotation requests
  getAllQuotations(): Observable<QuotationRequest[]> {
    return this.http.get<QuotationRequest[]>(this.apiUrl);
  }

  // Get quotation requests by contractor
  getContractorQuotations(contractorId: number): Observable<QuotationRequest[]> {
    return this.http.get<QuotationRequest[]>(`${this.apiUrl}/contractor/${contractorId}`);
  }

  // Create new quotation request
  createQuotation(quotationData: CreateQuotationRequest): Observable<QuotationRequest> {
    return this.http.post<QuotationRequest>(this.apiUrl, quotationData);
  }

  // Update quotation status
  updateQuotationStatus(quotationId: number, status: 'PENDING' | 'RECEIVED' | 'ACCEPTED' | 'REJECTED'): Observable<QuotationRequest> {
    return this.http.put<QuotationRequest>(`${this.apiUrl}/${quotationId}/status?status=${status}`, {});
  }

  // Submit a quote for a quotation request
  submitQuote(quotationRequestId: number, quoteData: CreateQuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(`${this.quotesUrl}/${quotationRequestId}`, quoteData);
  }

  // Update quote status
  updateQuoteStatus(quoteId: number, status: 'PENDING' | 'ACCEPTED' | 'REJECTED'): Observable<Quote> {
    return this.http.put<Quote>(`${this.quotesUrl}/${quoteId}/status?status=${status}`, {});
  }

  // Get quotes for a quotation request
  getQuotesByRequest(quotationRequestId: number): Observable<Quote[]> {
    return this.http.get<Quote[]>(`${this.quotesUrl}/request/${quotationRequestId}`);
  }
}