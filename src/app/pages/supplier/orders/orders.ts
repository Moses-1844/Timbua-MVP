// src/app/pages/supplier/orders/orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  SupplierOrder, 
  OrderStatusType,
  DeliveryTracking 
} from '../../../core/models/supplier.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class Orders implements OnInit {
  orders: SupplierOrder[] = [];
  filteredOrders: SupplierOrder[] = [];
  
  // Filters
  statusFilter: OrderStatusType | 'all' = 'all';
  searchTerm = '';
  dateFilter = 'all';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Selected order for details
  selectedOrder: SupplierOrder | null = null;
  showOrderDetails = false;
  deliveryTracking: DeliveryTracking | null = null;

  // Order status options for the template
  orderStatusOptions: OrderStatusType[] = [
    'pending', 'confirmed', 'processing', 'in-transit', 'delivered', 'cancelled', 'disputed'
  ];

  // Delivery status to order status mapping
  deliveryStatusMap: { [key: string]: OrderStatusType } = {
    'preparing': 'processing',
    'dispatched': 'in-transit',
    'in-transit': 'in-transit',
    'arrived': 'in-transit',
    'delivered': 'delivered'
  };

  constructor() {}

  ngOnInit() {
    this.loadOrders();
    this.applyFilters();
  }

  loadOrders() {
    // Mock data - same as before
    this.orders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        contractorId: 101,
        contractorName: 'BuildRight Constructions',
        contractorPhone: '+254712345678',
        supplierId: 1,
        materialSiteId: 1,
        materialName: 'Quality Ballast',
        materialCategory: 'Cement & Concrete',
        quantity: 50,
        unit: 'ton',
        unitPrice: 1800,
        totalAmount: 90000,
        deliveryCost: 5000,
        grandTotal: 95000,
        currency: 'KSH',
        deliveryAddress: 'Nairobi CBD, Moi Avenue',
        deliveryCoordinates: { lat: -1.2921, lng: 36.8219 },
        deliveryInstructions: 'Call before delivery',
        orderDate: '2024-01-20T08:00:00',
        status: 'in-transit',
        trackingId: 'TRK123456',
        estimatedDelivery: '2024-01-22T14:00:00',
        paymentStatus: 'paid',
        paymentMethod: 'MPesa',
        specialInstructions: 'Deliver to site office',
        createdAt: '2024-01-20T08:00:00',
        updatedAt: '2024-01-21T10:30:00'
      },
      // ... other orders
    ];
    
    this.applyFilters();
  }

  // Fix: Add method to safely convert delivery status to order status
  getOrderStatusFromDeliveryStatus(deliveryStatus: string): OrderStatusType {
    return this.deliveryStatusMap[deliveryStatus] || 'processing';
  }

  // Fix: Add method to get status color safely
  getStatusColor(status: string): string {
    const orderStatus = this.isOrderStatus(status) ? status : this.getOrderStatusFromDeliveryStatus(status);
    
    const colors: Record<OrderStatusType, string> = {
      'pending': 'warning',
      'confirmed': 'info',
      'processing': 'primary',
      'in-transit': 'accent',
      'delivered': 'success',
      'cancelled': 'danger',
      'disputed': 'danger'
    };
    return colors[orderStatus as OrderStatusType] || 'secondary';
  }

  // Helper method to check if a string is a valid OrderStatusType
  private isOrderStatus(status: string): status is OrderStatusType {
    return this.orderStatusOptions.includes(status as OrderStatusType);
  }

  // Fix: Update order status with type safety
  updateOrderStatus(order: SupplierOrder, newStatus: string) {
    if (!this.isOrderStatus(newStatus)) {
      console.error('Invalid order status:', newStatus);
      return;
    }

    if (confirm(`Change order ${order.orderNumber} status to ${newStatus}?`)) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      
      // Update timestamps based on status
      switch (newStatus) {
        case 'confirmed':
          order.confirmedDate = new Date().toISOString();
          break;
        case 'processing':
          order.processingDate = new Date().toISOString();
          break;
        case 'in-transit':
          order.shippedDate = new Date().toISOString();
          break;
        case 'delivered':
          order.deliveredDate = new Date().toISOString();
          break;
      }
      
      this.applyFilters();
      alert(`Order ${order.orderNumber} status updated to ${newStatus}`);
    }
  }

  // ... rest of your existing methods (applyFilters, filterDate, updatePagination, etc.)
  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.contractorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.materialName.toLowerCase().includes(this.searchTerm.toLowerCase());
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
    this.currentPage = Math.min(this.currentPage, this.totalPages);
  }

  get paginatedOrders(): SupplierOrder[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'warning',
      'paid': 'success',
      'failed': 'danger',
      'refunded': 'info'
    };
    return colors[status] || 'secondary';
  }

  viewOrderDetails(order: SupplierOrder) {
    this.selectedOrder = order;
    this.loadDeliveryTracking(order.id);
    this.showOrderDetails = true;
  }

  loadDeliveryTracking(orderId: number) {
    // Mock delivery tracking data
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

  getNextAction(order: SupplierOrder): string {
    switch (order.status) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Start Processing';
      case 'processing': return 'Dispatch Order';
      case 'in-transit': return 'Mark as Delivered';
      default: return '';
    }
  }

  getNextStatus(order: SupplierOrder): OrderStatusType | null {
    switch (order.status) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'processing';
      case 'processing': return 'in-transit';
      case 'in-transit': return 'delivered';
      default: return null;
    }
  }

  performNextAction(order: SupplierOrder) {
    const nextStatus = this.getNextStatus(order);
    if (nextStatus) {
      this.updateOrderStatus(order, nextStatus);
    }
  }

  calculateRevenue(): number {
    return this.orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((total, order) => total + order.grandTotal, 0);
  }

  getOrdersCountByStatus(status: OrderStatusType): number {
    return this.orders.filter(order => order.status === status).length;
  }

  exportOrders() {
    const headers = ['Order Number', 'Contractor', 'Material', 'Quantity', 'Total Amount', 'Status', 'Order Date'];
    const csvData = this.filteredOrders.map(order => [
      order.orderNumber,
      order.contractorName,
      order.materialName,
      `${order.quantity} ${order.unit}`,
      `KSH ${order.grandTotal.toLocaleString()}`,
      order.status,
      new Date(order.orderDate).toLocaleDateString()
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
}