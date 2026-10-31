import {
  User,
  Business,
  Product,
  Order,
  Customer,
  Supplier,
  Purchase,
  Expense,
  NotificationItem,
  DashboardMetrics,
  ForecastData,
  AuditLog
} from '../types';

const TOKEN_KEY = 'vyaparai_auth_token';
const BIZ_KEY = 'vyaparai_biz_id';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(BIZ_KEY);
}

export function getStoredBusinessId(): string | null {
  return localStorage.getItem(BIZ_KEY);
}

export function setStoredBusinessId(id: string) {
  localStorage.setItem(BIZ_KEY, id);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const currentBizId = getStoredBusinessId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (currentBizId) {
    headers['x-business-id'] = currentBizId;
  }

  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s client timeout

    res = await fetch(endpoint, {
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);
  } catch (netErr: any) {
    if (netErr.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out. Please try again.`);
    }
    throw new Error(netErr.message || 'Network connection failed. Please check your connection.');
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
    }
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      try {
        const text = await res.text();
        errorMsg = text.slice(0, 100) || res.statusText || errorMsg;
      } catch {
        errorMsg = res.statusText || errorMsg;
      }
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User; business: Business }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (payload: any) =>
    request<{ token: string; user: User; business: Business }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    request<{ user: User; business: Business; businesses: Business[] }>('/api/auth/me'),

  switchBusiness: (businessId: string) =>
    request<{ success: boolean; currentBusiness: Business }>('/api/auth/switch-business', {
      method: 'POST',
      body: JSON.stringify({ businessId })
    }),

  // Dashboard
  getDashboardStats: () =>
    request<{
      metrics: DashboardMetrics;
      weeklySales: Array<{ date: string; day: string; sales: number; orders: number; profit: number }>;
      categorySales: Array<{ category: string; amount: number }>;
      paymentBreakdown: Array<{ method: string; amount: number }>;
      bestSellers: Array<{ name: string; qty: number; revenue: number; profit: number }>;
      recentOrders: Order[];
    }>('/api/dashboard/stats'),

  // Products
  getProducts: (params?: { search?: string; category?: string; lowStock?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category) q.append('category', params.category);
    if (params?.lowStock) q.append('lowStock', 'true');
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<Product[]>(`/api/products${qs}`);
  },

  createProduct: (data: Partial<Product>) =>
    request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE'
    }),

  bulkImportProducts: (items: any[]) =>
    request<{ success: boolean; count: number; products: Product[] }>('/api/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ items })
    }),

  // POS & Orders
  checkoutOrder: (payload: any) =>
    request<Order>('/api/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getOrders: () => request<Order[]>('/api/orders'),

  updateOrderStatus: (id: string, status: 'Completed' | 'Cancelled' | 'Refunded') =>
    request<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  // Customers
  getCustomers: () => request<Customer[]>('/api/customers'),

  createCustomer: (data: Partial<Customer>) =>
    request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  recordKhataPayment: (id: string, amount: number, paymentMethod: string) =>
    request<{ success: boolean; customer: Customer }>(`/api/customers/${id}/record-payment`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod })
    }),

  // Suppliers & Purchases
  getSuppliers: () => request<Supplier[]>('/api/suppliers'),

  createSupplier: (data: Partial<Supplier>) =>
    request<Supplier>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getPurchases: () => request<Purchase[]>('/api/purchases'),

  createPurchase: (data: any) =>
    request<Purchase>('/api/purchases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Expenses
  getExpenses: () => request<Expense[]>('/api/expenses'),

  createExpense: (data: Partial<Expense>) =>
    request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteExpense: (id: string) =>
    request<{ success: boolean }>(`/api/expenses/${id}`, {
      method: 'DELETE'
    }),

  // AI Assistant & Forecasting
  askAI: (message: string, history: Array<{ role: 'user' | 'model'; parts: string }>) =>
    request<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history })
    }),

  getAIForecast: () => request<ForecastData>('/api/ai/forecast'),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),

  markNotificationAsRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }),

  // Subscriptions
  getPlans: () => request<any[]>('/api/subscription/plans'),

  upgradePlan: (planName: string) =>
    request<{ success: boolean; message: string; business: Business }>('/api/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planName })
    }),

  // Admin
  getAdminOverview: () => request<any>('/api/admin/overview'),

  // Audit Logs & Security
  getAuditLogs: (filters?: { severity?: string; entityType?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (filters?.severity) q.append('severity', filters.severity);
    if (filters?.entityType) q.append('entityType', filters.entityType);
    if (filters?.search) q.append('search', filters.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<AuditLog[]>(`/api/audit-logs${qs}`);
  }
};
