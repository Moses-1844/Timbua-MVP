// src/app/core/services/order.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface Order {
  id: number;
  materialId: number;
  material: string;
  supplierId: number;
  supplier: string;
  quantity: number;
  totalCost: number;
  currency: string;
  siteId: number;
  orderReference: string;
  orderDate: string;
  deliveryDate: string;
  status: 'ORDERED' | 'CONFIRMED' | 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentDate?: string;
  contractorName?: string;
  contractorPhone?: string;
  deliveryAddress?: string;
  unitPrice?: number;
  deliveryCost?: number;
  grandTotal?: number;
  trackingId?: string;
  estimatedDelivery?: string;
  deliveryInstructions?: string;
}

export interface CreateOrderRequest {
  materialId: number;
  material: string;
  supplierId: number;
  supplier: string;
  quantity: number;
  totalCost: number;
  currency: string;
  siteId: number;
  orderReference: string;
  orderDate: string;
  deliveryDate: string;
  status: 'ORDERED' | 'CONFIRMED' | 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentDate?: string;
}

export interface ApiResponse<T> {
  data: T;
  messageCode: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Get supplier ID from localStorage
  getSupplierId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const possibleKeys = ['currentUser', 'user', 'authUser', 'supplier'];
        
        for (const key of possibleKeys) {
          const userData = localStorage.getItem(key);
          if (userData) {
            const user = JSON.parse(userData);
            const supplierId = user.id || user.supplierId || user.userId;
            if (supplierId) {
              console.log('Found supplier ID for orders:', supplierId);
              return Number(supplierId);
            }
          }
        }
      } catch (error) {
        console.error('Error getting supplier ID from storage:', error);
      }
    }
    return null;
  }

  // Get all orders for a specific supplier
  getSupplierOrders(supplierId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/supplier/${supplierId}`);
  }

  // Get all orders (fallback method)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Get orders for a specific site
  getSiteOrders(siteId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/site/${siteId}`);
  }

  // Get orders with pending payments
  getPendingPaymentOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/pending-payments`);
  }

  // Create a new order
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/create`, orderData);
  }

  // Confirm payment for an order
  confirmPayment(orderId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/confirm-payment`, {});
  }

  // Cancel an order
  cancelOrder(orderId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  // Update order status (you might need to create this endpoint)
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, { status });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSupplierId() !== null;
  }
}