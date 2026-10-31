export type UserRole = 'Super Admin' | 'Business Owner' | 'Manager' | 'Cashier' | 'Inventory Staff';

export type BusinessCategory = 'Grocery / Kirana' | 'Medical Store / Pharmacy' | 'Retail & Apparel' | 'Wholesale & FMCG' | 'Electronics & Hardware' | 'General Store';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  businessIds: string[];
  currentBusinessId: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  category: BusinessCategory;
  gstin?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logoUrl?: string;
  currency: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  subscriptionExpiry: string;
  createdAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  stockQuantity: number;
  lowStockThreshold: number;
  gstRate: number;
  hsnCode?: string;
  batchNumber?: string;
  expiryDate?: string;
  supplierId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  gstRate: number;
  taxAmount: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit / Khata';
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid';
  status: 'Completed' | 'Cancelled' | 'Refunded';
  notes?: string;
  cashierName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  creditBalance: number;
  totalPurchases: number;
  totalOrders: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  pendingBalance: number;
  totalPurchased: number;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  businessId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  status: 'Received' | 'Ordered' | 'Cancelled';
  invoiceNumber?: string;
  purchaseDate: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: 'Rent' | 'Electricity & Utilities' | 'Staff Wages' | 'Packaging & Freight' | 'Repairs & Maintenance' | 'Marketing' | 'Other';
  title: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  date: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  businessId: string;
  type: 'low_stock' | 'expiry' | 'order' | 'payment' | 'subscription' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  todayRevenue: number;
  todayOrdersCount: number;
  grossProfit: number;
  netProfit: number;
  totalExpenses: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingKhata: number;
  pendingSuppliers: number;
}

export interface ForecastData {
  summary: string;
  projectedRevenue7Days: number;
  confidenceScore: number;
  growthRateEstimate: string;
  dailyForecast: Array<{
    day: string;
    predictedSales: number;
    predictedOrders: number;
    factor: string;
  }>;
  restockRecommendations: Array<{
    productName: string;
    urgency: 'High' | 'Medium';
    recommendedQuantity: number;
    reason: string;
  }>;
  seasonalTrends: string[];
}

export type AuditSeverity = 'info' | 'warning' | 'critical';
export type AuditEntityType = 'product' | 'order' | 'inventory' | 'customer' | 'expense' | 'auth' | 'settings' | 'supplier';

export interface AuditLog {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userRole?: string;
  action: string;
  severity: AuditSeverity;
  entityType: AuditEntityType;
  entityId?: string;
  details: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  timestamp: string;
}
