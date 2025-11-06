import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  // Extended properties for UI
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
  status: 'ORDERED';
  paymentStatus: 'PENDING_PAYMENT';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://timbuabackend.onrender.com/api/orders';

  constructor(private http: HttpClient) {}

  // Get all orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Get orders by supplier
  getSupplierOrders(supplierId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/supplier/${supplierId}`);
  }

  // Get orders by site
  getSiteOrders(siteId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/site/${siteId}`);
  }

  // Get pending payment orders
  getPendingPaymentOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/pending-payments`);
  }

  // Create new order
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/create`, orderData);
  }

  // Confirm payment
  confirmPayment(orderId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/confirm-payment`, {});
  }

  // Cancel order
  cancelOrder(orderId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/cancel`, {});
  }
}