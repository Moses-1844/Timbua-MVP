// src/app/models/supplier.model.ts

// Material Category Types
export type MaterialCategoryType = 
  | 'Cement & Concrete'
  | 'Steel & Metal'
  | 'Wood & Timber'
  | 'Electrical'
  | 'Plumbing'
  | 'Finishing'
  | 'Tools & Equipment'
  | 'Other';

// Unit Types
export type MaterialUnitType = 
  | 'ton'
  | 'm3'
  | 'kg'
  | 'bag'
  | 'piece'
  | 'roll'
  | 'sheet'
  | 'lorry'
  | 'unit';

// Delivery Time Types
export type DeliveryTimeType = 
  | '1-2'
  | '2-3'
  | '3-5'
  | '5-7'
  | 'immediate';

// Order Status Types
export type OrderStatusType = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'in-transit'
  | 'delivered'
  | 'cancelled'
  | 'disputed';

// Quotation Status Types
export type QuotationStatusType = 
  | 'pending'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'expired';

// Supplier Status Types
export type SupplierStatusType = 
  | 'pending'
  | 'verified'
  | 'suspended'
  | 'rejected';

// Rating Interface
export interface Rating {
  id: number;
  contractorId: number;
  contractorName: string;
  materialSiteId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  orderId?: number;
}

// Supplier Profile Interface
export interface SupplierProfile {
  id: number;
  companyName: string;
  businessRegistrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  status: SupplierStatusType;
  verificationDate?: string;
  yearsInBusiness: number;
  description?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Material Site Interface
export interface MaterialSite {
  id: number;
  supplierId: number;
  siteName: string;
  materialCategory: MaterialCategoryType;
  materialName: string;
  description?: string;
  
  // Location
  county: string;
  specificLocation: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Capacity & Inventory
  capacity: {
    total: number;
    available: number;
    unit: MaterialUnitType;
  };
  
  // Pricing
  pricing: {
    pricePerUnit: number;
    currency: string; // 'KSH'
    unit: MaterialUnitType;
    minOrder: number;
    deliveryCostPerKm: number;
    bulkDiscount?: {
      minQuantity: number;
      discountPercentage: number;
    };
  };
  
  // Delivery Information
  delivery: {
    providesDelivery: boolean;
    maxRadius: number; // in KM
    averageTime: DeliveryTimeType;
    availableForRushDelivery: boolean;
  };
  
  // Licensing & Compliance
  licensing: {
    hasMiningLicense: boolean;
    licenseNumber?: string;
    licenseFiles: string[]; // URLs to uploaded files
    isEnvironmentalCompliant: boolean;
    otherCertifications: string[];
  };
  
  // Quality & Specifications
  specifications: {
    qualityGrade?: string;
    size?: string;
    color?: string;
    brand?: string;
    origin?: string;
    additionalSpecs?: Record<string, any>;
  };
  
  // Status & Metadata
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  rating: {
    average: number;
    totalReviews: number;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Quotation Request Interface
export interface QuotationRequest {
  id: number;
  contractorId: number;
  contractorName: string;
  projectName: string;
  materialSiteId: number;
  materialCategory: MaterialCategoryType;
  materialName: string;
  quantity: number;
  unit: MaterialUnitType;
  deliveryLocation: string;
  deliveryCoordinates: {
    lat: number;
    lng: number;
  };
  distance: number; // in KM
  estimatedDeliveryCost: number;
  specialRequirements?: string;
  deadline: string;
  status: QuotationStatusType;
  createdAt: string;
  updatedAt: string;
}

// Supplier Quote Interface
export interface SupplierQuote {
  id: number;
  quotationRequestId: number;
  supplierId: number;
  materialSiteId: number;
  unitPrice: number;
  totalPrice: number;
  deliveryCost: number;
  deliveryTime: DeliveryTimeType;
  notes?: string;
  includesDelivery: boolean;
  validityPeriod: number; // in days
  status: QuotationStatusType;
  submittedAt: string;
  expiresAt: string;
}

// Supplier Order Interface
export interface SupplierOrder {
  id: number;
  orderNumber: string;
  contractorId: number;
  contractorName: string;
  contractorPhone: string;
  supplierId: number;
  materialSiteId: number;
  materialName: string;
  materialCategory: MaterialCategoryType;
  quantity: number;
  unit: MaterialUnitType;
  unitPrice: number;
  totalAmount: number;
  deliveryCost: number;
  grandTotal: number;
  currency: string;
  
  // Delivery Information
  deliveryAddress: string;
  deliveryCoordinates: {
    lat: number;
    lng: number;
  };
  deliveryInstructions?: string;
  
  // Order Timeline
  orderDate: string;
  confirmedDate?: string;
  processingDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  
  // Status & Tracking
  status: OrderStatusType;
  trackingId?: string;
  estimatedDelivery?: string;
  
  // Payment Information
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  
  // Additional Details
  specialInstructions?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Tracking Interface
export interface DeliveryTracking {
  id: number;
  orderId: number;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  estimatedArrival?: string;
  status: 'preparing' | 'dispatched' | 'in-transit' | 'arrived' | 'delivered';
  checkpoints: DeliveryCheckpoint[];
  lastUpdated: string;
}

export interface DeliveryCheckpoint {
  location: string;
  timestamp: string;
  status: string;
  notes?: string;
}

// Supplier Analytics Interface
export interface SupplierAnalytics {
  supplierId: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Order Metrics
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  
  // Material Metrics
  popularMaterials: {
    materialName: string;
    category: MaterialCategoryType;
    totalOrders: number;
    totalRevenue: number;
  }[];
  
  // Customer Metrics
  repeatCustomers: number;
  newCustomers: number;
  customerRatings: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  
  // Delivery Metrics
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  
  // Timeline
  startDate: string;
  endDate: string;
  generatedAt: string;
}

// Supplier Notification Interface
export interface SupplierNotification {
  id: number;
  supplierId: number;
  type: 'quotation' | 'order' | 'rating' | 'system' | 'payment';
  title: string;
  message: string;
  relatedId?: number; // ID of related quotation, order, etc.
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Supplier Settings Interface
export interface SupplierSettings {
  supplierId: number;
  
  // Notification Preferences
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    quotationRequests: boolean;
    newOrders: boolean;
    orderUpdates: boolean;
    newRatings: boolean;
    systemUpdates: boolean;
  };
  
  // Business Preferences
  business: {
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: string[]; // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    autoAcceptOrders: boolean;
    minimumOrderValue: number;
    holidayMode: boolean;
  };
  
  // Delivery Preferences
  delivery: {
    autoCalculateDelivery: boolean;
    defaultDeliveryRadius: number;
    rushDeliverySurcharge: number;
    freeDeliveryThreshold?: number;
  };
  
  // Payment Preferences
  payment: {
    acceptedMethods: string[];
    paymentTerms: string;
    requireDeposit: boolean;
    depositPercentage: number;
  };
}

// Supplier Dashboard Summary Interface
export interface SupplierDashboardSummary {
  supplierId: number;
  
  // Quick Stats
  stats: {
    activeMaterialSites: number;
    pendingQuotations: number;
    activeOrders: number;
    todaysDeliveries: number;
    totalRevenue: number;
    averageRating: number;
  };
  
  // Recent Activity
  recentQuotations: QuotationRequest[];
  recentOrders: SupplierOrder[];
  recentRatings: Rating[];
  
  // Performance Metrics
  performance: {
    quotationResponseRate: number;
    orderCompletionRate: number;
    onTimeDeliveryRate: number;
    customerSatisfaction: number;
  };
  
  // Alerts & Notifications
  unreadNotifications: number;
  urgentActions: string[];
}

// File Upload Interface
export interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

// Supplier Bank Account Interface
export interface SupplierBankAccount {
  id: number;
  supplierId: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode?: string;
  swiftCode?: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}

// Supplier Payment Interface
export interface SupplierPayment {
  id: number;
  supplierId: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  settlementDate?: string;
  fees: number;
  netAmount: number;
  createdAt: string;
} 