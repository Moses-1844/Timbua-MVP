import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService, Order, CreateOrderRequest } from '../../../core/services/order.service';

export interface DeliveryTracking {
  id: number;
  orderId: number;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  currentLocation?: { lat: number; lng: number };
  estimatedArrival?: string;
  status: string;
  checkpoints: Array<{
    location: string;
    timestamp: string;
    status: string;
  }>;
  lastUpdated: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class Orders implements OnInit {
  supplierId: number = 1; // This should come from auth service
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Filters
  statusFilter: string = 'all';
  searchTerm: string = '';
  dateFilter: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Selected order for details
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;
  deliveryTracking: DeliveryTracking | null = null;

  loading: boolean = true;
  error: string = '';

  // Order status options
  orderStatusOptions: string[] = [
    'ORDERED', 'CONFIRMED', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'
  ];

  // Payment status options
  paymentStatusOptions: string[] = [
    'PENDING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED'
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';

    this.orderService.getSupplierOrders(this.supplierId).subscribe({
      next: (orders) => {
        this.orders = this.enrichOrderData(orders);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders';
        this.loading = false;
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
  }

  private enrichOrderData(orders: Order[]): Order[] {
    return orders.map(order => ({
      ...order,
      contractorName: order.contractorName || 'Unknown Contractor',
      contractorPhone: order.contractorPhone || 'N/A',
      deliveryAddress: order.deliveryAddress || 'Address not specified',
      unitPrice: order.unitPrice || this.calculateUnitPrice(order.totalCost, order.quantity),
      deliveryCost: order.deliveryCost || this.calculateDeliveryCost(order.totalCost),
      grandTotal: order.grandTotal || order.totalCost,
      trackingId: order.trackingId || `TRK${order.id.toString().padStart(6, '0')}`,
      estimatedDelivery: order.estimatedDelivery || order.deliveryDate,
      deliveryInstructions: order.deliveryInstructions || 'No special instructions'
    }));
  }

  // Helper method to calculate unit price
  private calculateUnitPrice(totalCost: number, quantity: number): number {
    return Math.round(totalCost / quantity);
  }

  // Helper method to calculate delivery cost (10% of total cost)
  private calculateDeliveryCost(totalCost: number): number {
    return Math.round(totalCost * 0.1);
  }

  // Public method to get unit price for template
  getUnitPrice(order: Order): number {
    return order.unitPrice || this.calculateUnitPrice(order.totalCost, order.quantity);
  }

  // Public method to get delivery cost for template
  getDeliveryCost(order: Order): number {
    return order.deliveryCost || this.calculateDeliveryCost(order.totalCost);
  }

  // Public method to get grand total for template
  getGrandTotal(order: Order): number {
    return order.grandTotal || order.totalCost;
  }

  private loadMockData() {
    // Fallback mock data with proper typing
    this.orders = [
      {
        id: 1,
        materialId: 1,
        material: 'Quality Ballast',
        supplierId: this.supplierId,
        supplier: 'Kenya Quarry Ltd',
        quantity: 50,
        totalCost: 90000,
        currency: 'KSH',
        siteId: 1,
        orderReference: 'ORD-001',
        orderDate: '2024-01-20',
        deliveryDate: '2024-01-22',
        status: 'IN_TRANSIT',
        paymentStatus: 'PAID',
        paymentDate: '2024-01-20T10:30:00',
        contractorName: 'BuildRight Constructions',
        contractorPhone: '+254712345678',
        deliveryAddress: 'Nairobi CBD, Moi Avenue',
        unitPrice: 1800,
        deliveryCost: 5000,
        grandTotal: 95000,
        trackingId: 'TRK123456',
        estimatedDelivery: '2024-01-22T14:00:00',
        deliveryInstructions: 'Call before delivery'
      },
      {
        id: 2,
        materialId: 2,
        material: 'River Sand',
        supplierId: this.supplierId,
        supplier: 'Kenya Quarry Ltd',
        quantity: 30,
        totalCost: 75000,
        currency: 'KSH',
        siteId: 2,
        orderReference: 'ORD-002',
        orderDate: '2024-01-19',
        deliveryDate: '2024-01-21',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentDate: '2024-01-19T14:20:00',
        contractorName: 'Urban Developers Ltd',
        contractorPhone: '+254723456789',
        deliveryAddress: 'Westlands, Nairobi',
        unitPrice: 2500,
        deliveryCost: 3000,
        grandTotal: 78000,
        trackingId: 'TRK123457',
        estimatedDelivery: '2024-01-21T11:00:00',
        deliveryInstructions: 'Gate 3, Security will guide'
      },
      {
        id: 3,
        materialId: 3,
        material: 'Building Stones',
        supplierId: this.supplierId,
        supplier: 'Kenya Quarry Ltd',
        quantity: 20,
        totalCost: 48000,
        currency: 'KSH',
        siteId: 1,
        orderReference: 'ORD-003',
        orderDate: '2024-01-22',
        deliveryDate: '2024-01-24',
        status: 'ORDERED',
        paymentStatus: 'PENDING_PAYMENT',
        contractorName: 'Greenfield Builders',
        contractorPhone: '+254734567890',
        deliveryAddress: 'Thika Road, Ruiru',
        unitPrice: 2400,
        deliveryCost: 4000,
        grandTotal: 52000,
        trackingId: 'TRK123458',
        estimatedDelivery: '2024-01-24T09:00:00',
        deliveryInstructions: 'Site manager: John Mwangi'
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = this.statusFilter === 'all' || 
                           order.status.toLowerCase() === this.statusFilter.toLowerCase().replace('-', '_');
      const matchesSearch = !this.searchTerm || 
        order.orderReference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (order.contractorName && order.contractorName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        order.material.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDate = this.filterDate(order.orderDate);
      
      return matchesStatus && matchesSearch && matchesDate;
    });
    
    this.updatePagination();
  }

  filterDate(orderDate: string): boolean {
    const order = new Date(orderDate);
    const now = new Date();
    
    switch (this.dateFilter) {
      case 'today':
        return order.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return order >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return order >= monthAgo;
      default:
        return true;
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
  }

  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ORDERED': 'warning',
      'CONFIRMED': 'info',
      'PROCESSING': 'primary',
      'IN_TRANSIT': 'accent',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return statusMap[status] || 'secondary';
  }

  getStatusDisplay(status: string): string {
    const displayMap: { [key: string]: string } = {
      'ORDERED': 'Ordered',
      'CONFIRMED': 'Confirmed',
      'PROCESSING': 'Processing',
      'IN_TRANSIT': 'In Transit',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'PENDING_PAYMENT': 'Pending Payment',
      'PAID': 'Paid',
      'FAILED': 'Failed',
      'REFUNDED': 'Refunded'
    };
    return displayMap[status] || status;
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING_PAYMENT': 'warning',
      'PAID': 'success',
      'FAILED': 'danger',
      'REFUNDED': 'info'
    };
    return colors[status] || 'secondary';
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.loadDeliveryTracking(order.id);
    this.showOrderDetails = true;
  }

  loadDeliveryTracking(orderId: number) {
    // Mock delivery tracking data - in real app, this would come from API
    this.deliveryTracking = {
      id: 1,
      orderId: orderId,
      driverName: 'John Kamau',
      driverPhone: '+254712345679',
      vehicleNumber: 'KCA 123A',
      currentLocation: { lat: -1.2800, lng: 36.8200 },
      estimatedArrival: '2024-01-22T14:00:00',
      status: 'in-transit',
      checkpoints: [
        {
          location: 'Quarry Site - Kiambu',
          timestamp: '2024-01-22T08:00:00',
          status: 'Dispatched'
        },
        {
          location: 'Thika Road - Mlolongo',
          timestamp: '2024-01-22T10:30:00',
          status: 'In Transit'
        }
      ],
      lastUpdated: '2024-01-22T10:30:00'
    };
  }

  getNextAction(order: Order): string {
    switch (order.status) {
      case 'ORDERED': return 'Confirm Order';
      case 'CONFIRMED': return 'Start Processing';
      case 'PROCESSING': return 'Dispatch Order';
      case 'IN_TRANSIT': return 'Mark as Delivered';
      default: return '';
    }
  }

  getNextStatus(order: Order): string | null {
    switch (order.status) {
      case 'ORDERED': return 'CONFIRMED';
      case 'CONFIRMED': return 'PROCESSING';
      case 'PROCESSING': return 'IN_TRANSIT';
      case 'IN_TRANSIT': return 'DELIVERED';
      default: return null;
    }
  }

  performNextAction(order: Order) {
    const nextStatus = this.getNextStatus(order);
    if (nextStatus) {
      this.updateOrderStatus(order, nextStatus);
    }
  }

  updateOrderStatus(order: Order, newStatus: string) {
    if (confirm(`Change order ${order.orderReference} status to ${this.getStatusDisplay(newStatus)}?`)) {
      // In a real app, you would call an API endpoint to update the status
      console.log(`Updating order ${order.id} status to ${newStatus}`);
      
      // Update local data
      const index = this.orders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        this.orders[index].status = newStatus as any;
        this.orders[index].deliveryDate = new Date().toISOString().split('T')[0];
      }
      
      this.applyFilters();
      alert(`Order ${order.orderReference} status updated to ${this.getStatusDisplay(newStatus)}`);
    }
  }

  confirmPayment(order: Order) {
    this.orderService.confirmPayment(order.id).subscribe({
      next: () => {
        // Update local data
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index].paymentStatus = 'PAID';
          this.orders[index].paymentDate = new Date().toISOString();
        }
        
        this.applyFilters();
        alert(`Payment confirmed for order ${order.orderReference}`);
      },
      error: (err) => {
        console.error('Error confirming payment:', err);
        alert('Error confirming payment. Please try again.');
      }
    });
  }

  cancelOrder(order: Order) {
    if (confirm(`Are you sure you want to cancel order ${order.orderReference}?`)) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: () => {
          // Update local data
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index].status = 'CANCELLED';
          }
          
          this.applyFilters();
          alert(`Order ${order.orderReference} has been cancelled`);
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Error cancelling order. Please try again.');
        }
      });
    }
  }

  calculateRevenue(): number {
    return this.orders
      .filter(order => order.paymentStatus === 'PAID')
      .reduce((total, order) => total + this.getGrandTotal(order), 0);
  }

  getOrdersCountByStatus(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }

  exportOrders() {
    const headers = ['Order Reference', 'Contractor', 'Material', 'Quantity', 'Total Cost', 'Status', 'Order Date', 'Payment Status'];
    const csvData = this.filteredOrders.map(order => [
      order.orderReference,
      order.contractorName || 'N/A',
      order.material,
      `${order.quantity}`,
      `${order.currency} ${this.getGrandTotal(order).toLocaleString()}`,
      this.getStatusDisplay(order.status),
      order.orderDate,
      this.getStatusDisplay(order.paymentStatus)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supplier-orders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert('Orders exported successfully!');
  }

  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
    this.deliveryTracking = null;
  }

  refreshOrders() {
    this.loadOrders();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}