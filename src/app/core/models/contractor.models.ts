export interface ConstructionSite {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  type: string;
  estimatedCost: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  progress: number;
  documents: string[];
  contractorId: number;
}

export interface Material {
  id: number;
  name: string;
  category: string;
  supplier: string;
  supplierCoordinates: { lat: number; lng: number };
  price: number;
  currency: string;
  unit: string;
  location: string;
  rating: number;
  contact: string;
  deliveryTime: string;
  minOrder: number;
  available: boolean;
}

export interface SupplierMaterial {
  id: number;
  name: string;
  category: string;
  supplier: string;
  supplierLocation: [number, number];
  price: number;
  unit: string;
  distance?: number;
  rating: number;
  contact: string;
  deliveryTime: string;
  minOrder: number;
  currency?: string;
}

export interface Quote {
  id: number;
  supplier: string;
  price: number;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface QuotationRequest {
  id: number;
  materialId: number;
  material: string;
  quantity: number;
  unit: string;
  siteId: number;
  site: string;
  status: 'pending' | 'received' | 'accepted' | 'rejected';
  quotes: Quote[];
  deadline: string;
  contractorId: number;
}

export interface Order {
  id: number;
  materialId: number;
  material: string;
  supplierId: number;
  supplier: string;
  quantity: number;
  totalCost: number;
  currency: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
  siteId: number;
}

export interface Assessment {
  id: number;
  siteId: number;
  site: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  comments?: string;
  assessor?: string;
}

export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  contractorId: number;
}

export interface DashboardMetrics {
  activeProjects: number;
  pendingTasks: number;
  pendingQuotes: number;
  activeOrders: number;
  systemAlerts: number;
}

export interface Contractor {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  rating?: number;
  joinDate: string;
}

export interface SiteDocument {
  id: number;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  size: number;
  siteId: number;
}

export interface MaterialCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  specialties: string[];
  deliveryAreas: string[];
  businessLicense: string;
  joinDate: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  supplierId: number;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehiclePlate: string;
  estimatedArrival: string;
  actualArrival?: string;
  status: 'scheduled' | 'in-transit' | 'delivered' | 'delayed';
  currentLocation?: { lat: number; lng: number };
  notes?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  method: 'bank-transfer' | 'mobile-money' | 'cash' | 'credit-card';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  paymentDate?: string;
  dueDate: string;
}

export interface Notification {
  id: number;
  type: 'quote-received' | 'order-update' | 'assessment-status' | 'system-alert';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Filter interfaces
export interface SiteFilters {
  status: string;
  type: string;
  minCost: number;
  maxCost: number;
  startDate: string;
  endDate: string;
}

export interface MaterialFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  supplier: string;
  location: string;
  availableOnly: boolean;
}

export interface SupplierFilters {
  radius: number;
  materialType: string;
  maxPrice: number;
  minRating: number;
  searchQuery: string;
}

// Form data interfaces
export interface NewSiteData {
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  type: string;
  estimatedCost: number;
  status: 'planning' | 'active' | 'on-hold';
  description?: string;
  contractorId: number;
}
export interface QuotationRequest {
  id: number;
  materialId: number;
  material: string;
  quantity: number;
  unit: string;
  siteId: number;
  site: string;
  status: 'pending' | 'received' | 'accepted' | 'rejected';
  quotes: Quote[];
  deadline: string;
  contractorId: number;
  urgency?: 'low' | 'medium' | 'high';  // Add this line
  requirements?: string;                 // Add this line
}
export interface QuotationRequestData {
  material: string;
  quantity: number;
  unit: string;
  site: string;
  urgency: 'standard' | 'express' | 'urgent';
  requirements?: string;
  contractorId: number;
}

// Response interfaces for API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Chart data interfaces
export interface ProjectProgressData {
  siteName: string;
  progress: number;
  plannedProgress: number;
  startDate: string;
  endDate: string;
}

export interface CostAnalysisData {
  category: string;
  planned: number;
  actual: number;
  variance: number;
}

export interface MaterialUsageData {
  material: string;
  category: string;
  planned: number;
  used: number;
  unit: string;
}

// Utility types
export type StatusType = 
  | 'planning' | 'active' | 'completed' | 'on-hold'
  | 'pending' | 'approved' | 'rejected' | 'under-review'
  | 'ordered' | 'shipped' | 'delivered' | 'cancelled'
  | 'received' | 'accepted';
export interface QuotationRequest {
  id: number;
  materialId: number;
  material: string;
  quantity: number;
  unit: string;
  siteId: number;
  site: string;
  status: 'pending' | 'received' | 'accepted' | 'rejected';
  deadline: string;
  urgency?: 'low' | 'medium' | 'high';
  requirements?: string;
  quotes: Quote[];
  contractorId: number;
  createdAt?: string; // Add this if missing
}

export interface Quote {
  id: number;
  supplier: string;
  price: number;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ConstructionSite {
  id: number;
  name: string;
  location: string;
  // ... other properties
}
export type MaterialCategoryType = 
  | 'Cement & Concrete'
  | 'Steel & Metal'
  | 'Wood & Timber'
  | 'Electrical'
  | 'Plumbing'
  | 'Finishing'
  | 'Tools & Equipment'
  | 'Other';

// Sample data generators (for development)
export function generateSampleConstructionSite(id: number = 1): ConstructionSite {
  return {
    id,
    name: `Construction Site ${id}`,
    location: 'Nairobi, Kenya',
    coordinates: { lat: -1.2921 + (Math.random() - 0.5) * 0.1, lng: 36.8219 + (Math.random() - 0.5) * 0.1 },
    type: ['Commercial', 'Residential', 'Industrial'][Math.floor(Math.random() * 3)],
    estimatedCost: 10000000 + Math.floor(Math.random() * 90000000),
    status: ['planning', 'active', 'completed', 'on-hold'][Math.floor(Math.random() * 4)] as any,
    startDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    progress: Math.floor(Math.random() * 100),
    documents: [],
    contractorId: 1
  };
}

export function generateSampleSupplierMaterial(id: number = 1): SupplierMaterial {
  const categories: MaterialCategoryType[] = [
    'Cement & Concrete',
    'Steel & Metal',
    'Wood & Timber',
    'Electrical',
    'Plumbing',
    'Finishing',
    'Tools & Equipment'
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  return {
    id,
    name: `${category.split(' ')[0]} Material ${id}`,
    category,
    supplier: `Supplier ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    supplierLocation: [-1.2921 + (Math.random() - 0.5) * 0.5, 36.8219 + (Math.random() - 0.5) * 0.5],
    price: 1000 + Math.floor(Math.random() * 9000),
    unit: ['kg', 'bags', 'tons', 'units', 'meters'][Math.floor(Math.random() * 5)],
    distance: Math.floor(Math.random() * 200),
    rating: 3 + Math.random() * 2, // 3-5 stars
    contact: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
    deliveryTime: `${1 + Math.floor(Math.random() * 7)}-${3 + Math.floor(Math.random() * 10)} days`,
    minOrder: 10 + Math.floor(Math.random() * 100),
    currency: 'KSH'
  };
}

// Helper functions
export function getStatusColor(status: StatusType): string {
  const colors: Record<StatusType, string> = {
    'active': 'success',
    'planning': 'info',
    'completed': 'secondary',
    'on-hold': 'warning',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'under-review': 'info',
    'ordered': 'info',
    'shipped': 'primary',
    'delivered': 'success',
    'cancelled': 'danger',
    'received': 'info',
    'accepted': 'success'
  };
  return colors[status] || 'secondary';
}

export function getMaterialBadgeColor(category: MaterialCategoryType): string {
  const colors: Record<MaterialCategoryType, string> = {
    'Cement & Concrete': 'success',
    'Steel & Metal': 'danger',
    'Wood & Timber': 'warning',
    'Electrical': 'primary',
    'Plumbing': 'info',
    'Finishing': 'purple',
    'Tools & Equipment': 'gold',
    'Other': 'secondary'
  };
  return colors[category] || 'secondary';
}

export function formatCurrency(amount: number, currency: string = 'KSH'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}