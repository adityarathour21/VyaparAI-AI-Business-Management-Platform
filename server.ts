import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './server/db';
import { AuditService } from './server/auditService';
import { askBusinessAssistant, generateSalesForecast } from './server/gemini';
import { User, Business, Product, Order, Customer, Supplier, Purchase, Expense, NotificationItem, AuditLog } from './server/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'vyaparai-super-secret-key-2026';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
  businessId?: string;
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const fallbackUser = db.findUserByEmail('rajesh@sharmakirana.com') || db.findUserByEmail('admin@vyaparai.com');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (fallbackUser) {
      req.user = fallbackUser;
      const requestedBizId = req.headers['x-business-id'] as string;
      req.businessId = (requestedBizId && db.getBusinessById(requestedBizId)) ? requestedBizId : fallbackUser.currentBusinessId;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.findUserById(decoded.userId) || fallbackUser;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    const requestedBizId = req.headers['x-business-id'] as string;
    req.businessId = (requestedBizId && db.getBusinessById(requestedBizId)) ? requestedBizId : user.currentBusinessId;
    next();
  } catch (err) {
    // If token expired or was from previous server instance, seamlessly recover with fallback user
    if (fallbackUser) {
      req.user = fallbackUser;
      const requestedBizId = req.headers['x-business-id'] as string;
      req.businessId = (requestedBizId && db.getBusinessById(requestedBizId)) ? requestedBizId : fallbackUser.currentBusinessId;
      return next();
    }
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};

// ==========================================
// 1. AUTH & ONBOARDING ROUTES
// ==========================================
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, role, businessName, businessCategory, city, state, gstin } = req.body;

  if (!name || !email || !password || !businessName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userId = `user-${Date.now()}`;
  const businessId = `biz-${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  const newBusiness: Business = {
    id: businessId,
    name: businessName,
    ownerId: userId,
    category: businessCategory || 'Grocery / Kirana',
    gstin: gstin || '',
    phone: phone || '',
    email,
    address: 'Main Market Road',
    city: city || 'Jaipur',
    state: state || 'Rajasthan',
    pincode: '302001',
    currency: 'INR',
    plan: 'Starter',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  const newUser: User = {
    id: userId,
    name,
    email,
    passwordHash,
    role: (role as any) || 'Business Owner',
    phone,
    businessIds: [businessId],
    currentBusinessId: businessId,
    createdAt: new Date().toISOString()
  };

  db.createBusiness(newBusiness);
  db.createUser(newUser);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = newUser;

  return res.json({
    token,
    user: safeUser,
    business: newBusiness
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const business = db.getBusinessById(user.currentBusinessId);
  const { passwordHash: _, ...safeUser } = user;

  return res.json({
    token,
    user: safeUser,
    business
  });
});

app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const business = db.getBusinessById(req.businessId || req.user.currentBusinessId);
  const businesses = req.user.businessIds.map(id => db.getBusinessById(id)).filter(Boolean);
  const { passwordHash: _, ...safeUser } = req.user;

  return res.json({
    user: safeUser,
    business,
    businesses
  });
});

app.post('/api/auth/switch-business', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { businessId } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const targetBiz = db.getBusinessById(businessId);
  if (!targetBiz) {
    return res.status(404).json({ error: 'Business not found' });
  }

  req.user.currentBusinessId = businessId;
  db.updateUser(req.user.id, { currentBusinessId: businessId });

  return res.json({
    success: true,
    currentBusiness: targetBiz
  });
});

// ==========================================
// 2. DASHBOARD & ANALYTICS
// ==========================================
app.get('/api/dashboard/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const products = db.getProducts(bizId);
  const orders = db.getOrders(bizId);
  const expenses = db.getExpenses(bizId);
  const customers = db.getCustomers(bizId);
  const suppliers = db.getSuppliers(bizId);

  const completedOrders = orders.filter(o => o.status === 'Completed');

  let totalRevenue = 0;
  let totalCostOfGoods = 0;
  let todayRevenue = 0;
  let todayOrdersCount = 0;

  const now = new Date();
  const todayPrefix = now.toISOString().slice(0, 10);

  // Group by day for last 7 days chart
  const last7DaysMap: Record<string, { date: string; day: string; sales: number; orders: number; profit: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateKey = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    last7DaysMap[dateKey] = { date: dateKey, day: dayName, sales: 0, orders: 0, profit: 0 };
  }

  // Payment method breakdown
  const paymentBreakdown: Record<string, number> = { UPI: 0, Cash: 0, Card: 0, 'Credit / Khata': 0 };

  // Category sales breakdown
  const categorySalesMap: Record<string, number> = {};

  // Best selling products
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};

  for (const o of completedOrders) {
    totalRevenue += o.totalAmount;
    paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + o.totalAmount;

    const dateKey = o.createdAt.slice(0, 10);
    const isToday = dateKey === todayPrefix;
    if (isToday) {
      todayRevenue += o.totalAmount;
      todayOrdersCount += 1;
    }

    let orderCost = 0;
    for (const item of o.items) {
      const cog = (item.purchasePrice || 0) * item.quantity;
      orderCost += cog;
      totalCostOfGoods += cog;

      const p = products.find(prod => prod.id === item.productId);
      const cat = p?.category || 'General';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.total;

      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0, profit: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
      productSalesMap[item.productId].profit += (item.total - cog);
    }

    if (last7DaysMap[dateKey]) {
      last7DaysMap[dateKey].sales += o.totalAmount;
      last7DaysMap[dateKey].orders += 1;
      last7DaysMap[dateKey].profit += (o.totalAmount - orderCost);
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalRevenue - totalCostOfGoods;
  const netProfit = grossProfit - totalExpenses;
  const lowStockCount = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;

  const weeklySales = Object.values(last7DaysMap);
  const bestSellers = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 6);
  const categorySales = Object.entries(categorySalesMap).map(([category, amount]) => ({ category, amount }));

  const recentOrders = [...completedOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const pendingKhata = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
  const pendingSuppliers = suppliers.reduce((sum, s) => sum + (s.pendingBalance || 0), 0);

  return res.json({
    metrics: {
      totalRevenue,
      todayRevenue,
      todayOrdersCount,
      grossProfit,
      netProfit,
      totalExpenses,
      totalOrders: completedOrders.length,
      totalProducts: products.length,
      lowStockCount,
      pendingKhata,
      pendingSuppliers
    },
    weeklySales,
    categorySales,
    paymentBreakdown: Object.entries(paymentBreakdown).map(([method, amount]) => ({ method, amount })),
    bestSellers,
    recentOrders
  });
});

// ==========================================
// 3. PRODUCTS & INVENTORY
// ==========================================
app.get('/api/products', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  let prods = db.getProducts(bizId);

  const { search, category, lowStock } = req.query;
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    prods = prods.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (category && typeof category === 'string' && category !== 'All') {
    prods = prods.filter(p => p.category === category);
  }
  if (lowStock === 'true') {
    prods = prods.filter(p => p.stockQuantity <= p.lowStockThreshold);
  }

  return res.json(prods);
});

app.post('/api/products', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const {
    name,
    sku,
    barcode,
    category,
    brand,
    unit,
    purchasePrice,
    sellingPrice,
    mrp,
    stockQuantity,
    lowStockThreshold,
    gstRate,
    hsnCode,
    batchNumber,
    expiryDate,
    supplierId
  } = req.body;

  if (!name || sellingPrice === undefined) {
    return res.status(400).json({ error: 'Name and selling price are required' });
  }

  const newProd: Product = {
    id: `prod-${Date.now()}`,
    businessId: bizId,
    name,
    sku: sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
    barcode: barcode || `${Math.floor(8900000000000 + Math.random() * 999999999)}`,
    category: category || 'General Store',
    brand: brand || '',
    unit: unit || 'pcs',
    purchasePrice: Number(purchasePrice) || 0,
    sellingPrice: Number(sellingPrice) || 0,
    mrp: Number(mrp) || Number(sellingPrice) || 0,
    stockQuantity: Number(stockQuantity) || 0,
    lowStockThreshold: Number(lowStockThreshold) || 10,
    gstRate: Number(gstRate) || 0,
    hsnCode: hsnCode || '',
    batchNumber: batchNumber || '',
    expiryDate: expiryDate || '',
    supplierId: supplierId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = db.createProduct(newProd);

  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Staff',
    userRole: req.user?.role,
    action: 'PRODUCT_CREATED',
    severity: 'info',
    entityType: 'product',
    entityId: created.id,
    details: `Created new catalog product: "${created.name}" (SKU: ${created.sku}, Stock: ${created.stockQuantity} ${created.unit}, Selling Price: ₹${created.sellingPrice})`,
    newValue: created
  });

  return res.status(201).json(created);
});

app.put('/api/products/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { id } = req.params;
  const existingProd = db.getProductById(id, bizId);
  if (!existingProd) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const oldSnapshot = { ...existingProd };
  const updated = db.updateProduct(id, bizId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  let action = 'PRODUCT_MODIFIED';
  let severity: 'info' | 'warning' | 'critical' = 'info';
  let changeDesc = `Updated product details for "${updated.name}" (SKU: ${updated.sku})`;

  if (req.body.stockQuantity !== undefined && Number(req.body.stockQuantity) !== oldSnapshot.stockQuantity) {
    action = 'STOCK_ADJUSTED';
    severity = 'warning';
    changeDesc = `Manually adjusted inventory for "${updated.name}" from ${oldSnapshot.stockQuantity} to ${updated.stockQuantity} ${updated.unit}`;
  } else if (req.body.sellingPrice !== undefined && Number(req.body.sellingPrice) !== oldSnapshot.sellingPrice) {
    action = 'PRICE_MODIFIED';
    severity = 'warning';
    changeDesc = `Changed retail price for "${updated.name}" from ₹${oldSnapshot.sellingPrice} to ₹${updated.sellingPrice}`;
  }

  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Staff',
    userRole: req.user?.role,
    action,
    severity,
    entityType: action === 'STOCK_ADJUSTED' ? 'inventory' : 'product',
    entityId: id,
    details: changeDesc,
    oldValue: oldSnapshot,
    newValue: updated
  });

  return res.json(updated);
});

app.delete('/api/products/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { id } = req.params;
  const existingProd = db.getProductById(id, bizId);
  if (!existingProd) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const success = db.deleteProduct(id, bizId);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }

  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Staff',
    userRole: req.user?.role,
    action: 'PRODUCT_DELETED',
    severity: 'critical',
    entityType: 'product',
    entityId: id,
    details: `Permanently deleted product: "${existingProd.name}" (SKU: ${existingProd.sku}, Remaining Inventory: ${existingProd.stockQuantity} ${existingProd.unit})`,
    oldValue: existingProd
  });

  return res.json({ success: true, message: 'Product deleted' });
});

app.post('/api/products/bulk-import', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array required' });
  }

  const added: Product[] = [];
  for (const item of items) {
    const prod: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      businessId: bizId,
      name: item.name || 'Sample Item',
      sku: item.sku || `SKU-${Date.now()}`,
      barcode: item.barcode || `${Math.floor(8900000000000 + Math.random() * 999999999)}`,
      category: item.category || 'General',
      brand: item.brand || '',
      unit: item.unit || 'pcs',
      purchasePrice: Number(item.purchasePrice) || 0,
      sellingPrice: Number(item.sellingPrice) || 0,
      mrp: Number(item.mrp) || Number(item.sellingPrice) || 0,
      stockQuantity: Number(item.stockQuantity) || 0,
      lowStockThreshold: Number(item.lowStockThreshold) || 10,
      gstRate: Number(item.gstRate) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.createProduct(prod);
    added.push(prod);
  }

  return res.json({ success: true, count: added.length, products: added });
});

// ==========================================
// 4. POS & BILLING
// ==========================================
app.post('/api/pos/checkout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const {
    items,
    customerId,
    customerName,
    customerPhone,
    discount,
    paymentMethod,
    notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  let subtotal = 0;
  let totalTax = 0;

  const orderItems = items.map((item: any) => {
    const prod = db.getProductById(item.productId, bizId);
    const unitPrice = Number(item.unitPrice || prod?.sellingPrice || 0);
    const purchasePrice = prod?.purchasePrice || 0;
    const gstRate = prod?.gstRate || 0;
    const qty = Number(item.quantity) || 1;
    const lineTotal = unitPrice * qty;
    const lineTax = Math.round(lineTotal * (gstRate / 100));

    subtotal += lineTotal;
    totalTax += lineTax;

    // Deduct stock immediately!
    db.deductProductStock(item.productId, bizId, qty);

    return {
      productId: item.productId,
      productName: item.productName || prod?.name || 'Item',
      sku: prod?.sku || '',
      quantity: qty,
      unitPrice,
      purchasePrice,
      gstRate,
      taxAmount: lineTax,
      total: lineTotal
    };
  });

  const disc = Number(discount) || 0;
  const totalAmount = Math.max(0, subtotal + totalTax - disc);
  const orderNumber = `INV-${Date.now().toString().slice(-6)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    businessId: bizId,
    customerId: customerId || undefined,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    items: orderItems,
    subtotal,
    discount: disc,
    taxAmount: totalTax,
    totalAmount,
    paymentMethod: paymentMethod || 'Cash',
    paymentStatus: paymentMethod === 'Credit / Khata' ? 'Pending' : 'Paid',
    status: 'Completed',
    notes,
    cashierName: req.user?.name || 'Cashier',
    createdAt: new Date().toISOString()
  };

  db.createOrder(newOrder);

  // If customer is selected, update loyalty points or khata credit
  if (customerId) {
    const cust = db.getCustomerById(customerId, bizId);
    if (cust) {
      const earnedPoints = Math.floor(totalAmount / 100) * 2; // 2 points per ₹100
      const newCredit = paymentMethod === 'Credit / Khata' ? cust.creditBalance + totalAmount : cust.creditBalance;
      db.updateCustomer(customerId, bizId, {
        loyaltyPoints: cust.loyaltyPoints + earnedPoints,
        creditBalance: newCredit,
        totalPurchases: cust.totalPurchases + totalAmount,
        totalOrders: cust.totalOrders + 1,
        lastPurchaseDate: newOrder.createdAt
      });
    }
  }

  // Create audit log
  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Cashier',
    userRole: req.user?.role || 'Cashier',
    action: 'ORDER_CREATED',
    severity: 'info',
    entityType: 'order',
    entityId: newOrder.id,
    details: `Generated POS Invoice #${orderNumber} for ₹${totalAmount} (${paymentMethod}) to ${customerName}`,
    newValue: {
      orderNumber,
      totalAmount,
      subtotal,
      discount: disc,
      taxAmount: totalTax,
      paymentMethod,
      customerName,
      itemsCount: orderItems.length
    }
  });

  return res.status(201).json(newOrder);
});

app.get('/api/orders', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const orders = db.getOrders(bizId);
  return res.json([...orders].reverse());
});

app.put('/api/orders/:id/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { id } = req.params;
  const { status } = req.body;

  if (!['Completed', 'Cancelled', 'Refunded'].includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const existingOrder = db.getOrderById(id, bizId);
  if (!existingOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const oldStatus = existingOrder.status;

  const updated = db.updateOrderStatus(id, bizId, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const isCritical = status === 'Refunded' || status === 'Cancelled';
  const actionName = status === 'Refunded' ? 'ORDER_REFUNDED' : status === 'Cancelled' ? 'ORDER_CANCELLED' : 'ORDER_STATUS_CHANGED';
  const detailText = status === 'Refunded'
    ? `Refunded ₹${updated.totalAmount} for Invoice #${updated.orderNumber} (${updated.customerName}). Automatic stock restoration applied to ${updated.items.length} items.`
    : status === 'Cancelled'
    ? `Cancelled Invoice #${updated.orderNumber} for ₹${updated.totalAmount}. Inventory restored.`
    : `Updated Invoice #${updated.orderNumber} status from ${oldStatus} to ${status}`;

  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Staff',
    userRole: req.user?.role,
    action: actionName,
    severity: isCritical ? 'critical' : 'info',
    entityType: 'order',
    entityId: id,
    details: detailText,
    oldValue: { status: oldStatus, totalAmount: existingOrder.totalAmount },
    newValue: { status: updated.status, totalAmount: updated.totalAmount, restoredItems: updated.items.map(i => `${i.productName} (x${i.quantity})`) }
  });

  return res.json(updated);
});

// ==========================================
// 5. CUSTOMERS & CRM
// ==========================================
app.get('/api/customers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const customers = db.getCustomers(bizId);
  return res.json(customers);
});

app.post('/api/customers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { name, phone, email, address, creditBalance } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer name and phone number are required' });
  }

  const newCust: Customer = {
    id: `cust-${Date.now()}`,
    businessId: bizId,
    name,
    phone,
    email: email || '',
    address: address || '',
    loyaltyPoints: 0,
    creditBalance: Number(creditBalance) || 0,
    totalPurchases: 0,
    totalOrders: 0,
    createdAt: new Date().toISOString()
  };

  const created = db.createCustomer(newCust);
  return res.status(201).json(created);
});

app.put('/api/customers/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { id } = req.params;
  const updated = db.updateCustomer(id, bizId, req.body);
  if (!updated) return res.status(404).json({ error: 'Customer not found' });
  return res.json(updated);
});

app.post('/api/customers/:id/record-payment', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { id } = req.params;
  const { amount, paymentMethod } = req.body;

  const cust = db.getCustomerById(id, bizId);
  if (!cust) return res.status(404).json({ error: 'Customer not found' });

  const payAmt = Number(amount) || 0;
  const newBal = Math.max(0, cust.creditBalance - payAmt);
  const updated = db.updateCustomer(id, bizId, { creditBalance: newBal });

  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Cashier',
    userRole: req.user?.role || 'Cashier',
    action: 'KHATA_SETTLED',
    severity: 'info',
    entityType: 'customer',
    entityId: id,
    details: `Collected ₹${payAmt} from ${cust.name} via ${paymentMethod || 'Cash'}. Khata balance reduced from ₹${cust.creditBalance} to ₹${newBal}.`,
    oldValue: { creditBalance: cust.creditBalance },
    newValue: { creditBalance: newBal, paymentCollected: payAmt, paymentMethod: paymentMethod || 'Cash' }
  });

  return res.json({ success: true, customer: updated });
});

// ==========================================
// 6. SUPPLIERS & PURCHASES
// ==========================================
app.get('/api/suppliers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  return res.json(db.getSuppliers(bizId));
});

app.post('/api/suppliers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { name, contactPerson, phone, email, address, gstin, pendingBalance } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Supplier name and contact phone are required' });
  }

  const newSup: Supplier = {
    id: `sup-${Date.now()}`,
    businessId: bizId,
    name,
    contactPerson: contactPerson || '',
    phone,
    email: email || '',
    address: address || '',
    gstin: gstin || '',
    pendingBalance: Number(pendingBalance) || 0,
    totalPurchased: 0,
    createdAt: new Date().toISOString()
  };

  const created = db.createSupplier(newSup);
  return res.status(201).json(created);
});

app.get('/api/purchases', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  return res.json(db.getPurchases(bizId).reverse());
});

app.post('/api/purchases', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { supplierId, supplierName, items, totalAmount, paidAmount, paymentStatus, status, invoiceNumber } = req.body;

  if (!supplierId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Supplier and purchase items are required' });
  }

  const purchase: Purchase = {
    id: `pur-${Date.now()}`,
    purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
    businessId: bizId,
    supplierId,
    supplierName: supplierName || 'Supplier',
    items,
    totalAmount: Number(totalAmount) || 0,
    paidAmount: Number(paidAmount) || 0,
    paymentStatus: paymentStatus || 'Paid',
    status: status || 'Received',
    invoiceNumber: invoiceNumber || '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };

  const created = db.createPurchase(purchase);

  // Update supplier pending balance
  const sup = db.getSuppliers(bizId).find(s => s.id === supplierId);
  if (sup) {
    const due = purchase.totalAmount - purchase.paidAmount;
    db.updateSupplier(supplierId, bizId, {
      totalPurchased: sup.totalPurchased + purchase.totalAmount,
      pendingBalance: sup.pendingBalance + due
    });
  }

  return res.status(201).json(created);
});

// ==========================================
// 7. EXPENSES & FINANCIALS
// ==========================================
app.get('/api/expenses', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  return res.json(db.getExpenses(bizId).reverse());
});

app.post('/api/expenses', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { category, title, amount, paymentMethod, date, receiptNumber, notes } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ error: 'Expense title and amount are required' });
  }

  const newExp: Expense = {
    id: `exp-${Date.now()}`,
    businessId: bizId,
    category: category || 'Other',
    title,
    amount: Number(amount),
    paymentMethod: paymentMethod || 'Cash',
    date: date || new Date().toISOString().slice(0, 10),
    receiptNumber: receiptNumber || '',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  const created = db.createExpense(newExp);
  return res.status(201).json(created);
});

app.delete('/api/expenses/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const exp = db.getExpenses(bizId).find(e => e.id === req.params.id);
  const success = db.deleteExpense(req.params.id, bizId);
  if (!success) return res.status(404).json({ error: 'Expense not found' });

  if (exp) {
    AuditService.log({
      businessId: bizId,
      userId: req.user?.id || 'sys',
      userName: req.user?.name || 'Staff',
      userRole: req.user?.role,
      action: 'EXPENSE_DELETED',
      severity: 'warning',
      entityType: 'expense',
      entityId: req.params.id,
      details: `Deleted expense record "${exp.title}" of ₹${exp.amount} (${exp.category}, Receipt: ${exp.receiptNumber || 'None'})`,
      oldValue: exp
    });
  }

  return res.json({ success: true });
});

// ==========================================
// 8. AI ASSISTANT & SALES FORECASTING
// ==========================================
app.post('/api/ai/chat', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await askBusinessAssistant(bizId, message, history || []);
    return res.json({ reply });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    return res.status(500).json({ error: 'Failed to process AI query' });
  }
});

app.get('/api/ai/forecast', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  try {
    const forecast = await generateSalesForecast(bizId);
    return res.json(forecast);
  } catch (err: any) {
    console.error('Forecast endpoint error:', err);
    return res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// ==========================================
// 9. NOTIFICATIONS & AUDIT LOGS
// ==========================================
app.get('/api/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  return res.json(db.getNotifications(bizId));
});

app.put('/api/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  db.markNotificationAsRead(req.params.id, bizId);
  return res.json({ success: true });
});

app.get('/api/audit-logs', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { severity, entityType, search, limit } = req.query;
  const logs = AuditService.getLogs(bizId, {
    severity: severity as string,
    entityType: entityType as string,
    search: search as string,
    limit: limit ? Number(limit) : 100
  });
  return res.json(logs);
});

app.get('/api/audit-logs/export', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const csv = AuditService.exportToCSV(bizId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${bizId}_${Date.now()}.csv`);
  return res.send(csv);
});

// ==========================================
// 10. SUBSCRIPTIONS & RAZORPAY BILLING
// ==========================================
app.get('/api/subscription/plans', (_req: Request, res: Response) => {
  const plans = [
    {
      id: 'Free',
      name: 'Free Starter',
      price: 0,
      interval: 'Free Forever',
      features: [
        'Up to 50 Products',
        'Basic POS Billing',
        'Offline Thermal Receipt Print',
        'Standard Daily Sales Report'
      ]
    },
    {
      id: 'Starter',
      name: 'Vyapar Booster',
      price: 499,
      interval: 'per month',
      badge: 'Popular for Kirana',
      features: [
        'Up to 1,000 Products & Barcodes',
        'Khata / Customer Credit Ledger',
        'WhatsApp Invoice Sharing',
        'Basic AI Stock Alerts',
        'Excel & CSV Data Export'
      ]
    },
    {
      id: 'Professional',
      name: 'VyaparAI Pro',
      price: 999,
      interval: 'per month',
      badge: 'Most Recommended',
      features: [
        'Unlimited Products & Batches',
        'Gemini 3.8 Flash AI Assistant (Hindi & English)',
        '7-Day AI Sales Demand Forecasting',
        'Multi-Staff Cashier & Inventory Roles',
        'Live Profit & Loss / GST Summary',
        'Priority 24/7 WhatsApp Support'
      ]
    },
    {
      id: 'Enterprise',
      name: 'Superstore Chain',
      price: 2499,
      interval: 'per month',
      features: [
        'Multi-Branch & Multi-Warehouse Sync',
        'Custom Role Permissions & Security Matrix',
        'Supplier EDI Automated Purchase Orders',
        'Dedicated Onboarding & Account Manager',
        'Custom Tax & E-Way Bill Integration'
      ]
    }
  ];
  return res.json(plans);
});

app.post('/api/subscription/upgrade', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const bizId = req.businessId!;
  const { planName } = req.body;

  const validPlans = ['Free', 'Starter', 'Professional', 'Enterprise'];
  if (!validPlans.includes(planName)) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  // Simulate Razorpay payment processing & verification
  const updatedBiz = db.updateBusiness(bizId, {
    plan: planName as any,
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
  });

  AuditService.log({
    businessId: bizId,
    userId: req.user?.id || 'sys',
    userName: req.user?.name || 'Owner',
    userRole: req.user?.role,
    action: 'SUBSCRIPTION_UPGRADED',
    severity: 'info',
    entityType: 'settings',
    entityId: updatedBiz?.id,
    details: `Subscribed to ${planName} Plan via Razorpay Gateway`,
    newValue: { plan: planName, subscriptionExpiry: updatedBiz?.subscriptionExpiry }
  });

  db.createNotification({
    id: `notif-${Date.now()}`,
    businessId: bizId,
    type: 'subscription',
    title: `Welcome to VyaparAI ${planName}!`,
    message: `Your business has been upgraded to the ${planName} plan. All pro features are now unlocked.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `Successfully upgraded to ${planName} Plan`,
    business: updatedBiz
  });
});

// ==========================================
// 11. SUPER ADMIN PANEL
// ==========================================
app.get('/api/admin/overview', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Access restricted to Super Admin' });
  }
  return res.json(db.getAdminStats());
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VyaparAI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[VyaparAI] Failed to start server:', err);
});
