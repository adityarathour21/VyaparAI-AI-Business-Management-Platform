import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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
  AuditLog
} from './types';

interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  expenses: Expense[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'vyaparai_db.json');

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      businesses: [],
      products: [],
      orders: [],
      customers: [],
      suppliers: [],
      purchases: [],
      expenses: [],
      notifications: [],
      auditLogs: []
    };
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[VyaparAI DB] Loaded existing database from disk');
        return;
      } catch (err) {
        console.error('[VyaparAI DB] Error parsing db file, reseeding:', err);
      }
    }

    this.seedDefaultData();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[VyaparAI DB] Failed to persist data:', err);
    }
  }

  private seedDefaultData() {
    console.log('[VyaparAI DB] Seeding initial database...');
    const hashedSharma = bcrypt.hashSync('sharma123', 10);
    const hashedAdmin = bcrypt.hashSync('admin123', 10);

    const businessId1 = 'biz-sharma-kirana';
    const businessId2 = 'biz-apollo-care';
    const ownerId1 = 'user-rajesh-sharma';
    const adminId = 'user-super-admin';

    // Users
    this.data.users = [
      {
        id: ownerId1,
        name: 'Rajesh Sharma',
        email: 'rajesh@sharmakirana.com',
        passwordHash: hashedSharma,
        role: 'Business Owner',
        phone: '+91 98290 12345',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        businessIds: [businessId1, businessId2],
        currentBusinessId: businessId1,
        createdAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: adminId,
        name: 'Super Admin',
        email: 'admin@vyaparai.com',
        passwordHash: hashedAdmin,
        role: 'Super Admin',
        phone: '+91 98000 00001',
        businessIds: [businessId1],
        currentBusinessId: businessId1,
        createdAt: '2026-01-01T10:00:00.000Z'
      },
      {
        id: 'user-amit-cashier',
        name: 'Amit Verma',
        email: 'amit@sharmakirana.com',
        passwordHash: hashedSharma,
        role: 'Cashier',
        phone: '+91 98290 99887',
        businessIds: [businessId1],
        currentBusinessId: businessId1,
        createdAt: '2026-01-15T10:00:00.000Z'
      }
    ];

    // Businesses
    this.data.businesses = [
      {
        id: businessId1,
        name: 'Sharma Superstore & Kirana',
        ownerId: ownerId1,
        category: 'Grocery / Kirana',
        gstin: '08AAACS1429B1ZB',
        phone: '+91 98290 12345',
        email: 'contact@sharmakirana.com',
        address: 'Shop No. 14, Main Market, Malviya Nagar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302017',
        currency: 'INR',
        plan: 'Professional',
        subscriptionExpiry: '2026-12-31T23:59:59.000Z',
        createdAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: businessId2,
        name: 'Apollo Care Pharmacy & Medicals',
        ownerId: ownerId1,
        category: 'Medical Store / Pharmacy',
        gstin: '27AAACS9988C1ZD',
        phone: '+91 98222 54321',
        email: 'apollocare@mumbai.in',
        address: 'B-Wing, Sector 4, Vashi',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400703',
        currency: 'INR',
        plan: 'Starter',
        subscriptionExpiry: '2026-11-30T23:59:59.000Z',
        createdAt: '2026-02-01T10:00:00.000Z'
      }
    ];

    // Suppliers
    this.data.suppliers = [
      {
        id: 'sup-1',
        businessId: businessId1,
        name: 'Hindustan Unilever Distributor (HUL)',
        contactPerson: 'Mukesh Gupta',
        phone: '+91 98280 44556',
        email: 'hul.distributor.jp@gmail.com',
        address: 'RIICO Industrial Area, Mansarovar, Jaipur',
        gstin: '08AABCH1234F1Z0',
        pendingBalance: 12500,
        totalPurchased: 245000,
        createdAt: '2026-01-12T10:00:00.000Z'
      },
      {
        id: 'sup-2',
        businessId: businessId1,
        name: 'ITC Wholesale Depot',
        contactPerson: 'Sanjay Agarwal',
        phone: '+91 94140 88776',
        email: 'itc.wholesale@jaipur.in',
        address: 'Anaj Mandi, Chandpole, Jaipur',
        gstin: '08AABCI8989G1Z8',
        pendingBalance: 0,
        totalPurchased: 180000,
        createdAt: '2026-01-14T10:00:00.000Z'
      },
      {
        id: 'sup-3',
        businessId: businessId1,
        name: 'Amul Dairy Federation Depot',
        contactPerson: 'Dinesh Patel',
        phone: '+91 98790 33221',
        email: 'amul.depot.west@amul.coop',
        address: 'Transport Nagar, Jaipur',
        pendingBalance: 4200,
        totalPurchased: 98000,
        createdAt: '2026-02-01T10:00:00.000Z'
      }
    ];

    // Products
    this.data.products = [
      {
        id: 'prod-1',
        businessId: businessId1,
        name: 'Aashirvaad Shudh Chakki Atta (10kg)',
        sku: 'ATT-AAS-10K',
        barcode: '8901030382910',
        category: 'Flour & Grains',
        brand: 'ITC Aashirvaad',
        unit: 'packet',
        purchasePrice: 410,
        sellingPrice: 475,
        mrp: 495,
        stockQuantity: 42,
        lowStockThreshold: 15,
        gstRate: 5,
        hsnCode: '1101',
        batchNumber: 'B-2610A',
        expiryDate: '2027-04-15',
        supplierId: 'sup-2',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-2',
        businessId: businessId1,
        name: 'Fortune Sunlite Refined Sunflower Oil (1L)',
        sku: 'OIL-FOR-01L',
        barcode: '8906007281014',
        category: 'Edible Oils & Ghee',
        brand: 'Adani Wilmar',
        unit: 'packet',
        purchasePrice: 125,
        sellingPrice: 148,
        mrp: 160,
        stockQuantity: 65,
        lowStockThreshold: 20,
        gstRate: 5,
        hsnCode: '1512',
        batchNumber: 'FO-991',
        expiryDate: '2027-06-30',
        supplierId: 'sup-1',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-3',
        businessId: businessId1,
        name: 'Tata Salt Vacuum Evaporated (1kg)',
        sku: 'SLT-TAT-01K',
        barcode: '8901030010011',
        category: 'Spices & Seasoning',
        brand: 'Tata Consumer',
        unit: 'packet',
        purchasePrice: 22,
        sellingPrice: 28,
        mrp: 30,
        stockQuantity: 120,
        lowStockThreshold: 30,
        gstRate: 0,
        hsnCode: '2501',
        batchNumber: 'TS-2026',
        expiryDate: '2028-01-01',
        supplierId: 'sup-1',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-4',
        businessId: businessId1,
        name: 'India Gate Basmati Rice Feast Rozzana (5kg)',
        sku: 'RIC-ING-05K',
        barcode: '8901512000547',
        category: 'Flour & Grains',
        brand: 'India Gate',
        unit: 'packet',
        purchasePrice: 380,
        sellingPrice: 460,
        mrp: 499,
        stockQuantity: 18,
        lowStockThreshold: 10,
        gstRate: 5,
        hsnCode: '1006',
        batchNumber: 'IG-554',
        expiryDate: '2027-12-31',
        supplierId: 'sup-2',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-5',
        businessId: businessId1,
        name: 'Maggi 2-Minute Masala Instant Noodles (70g)',
        sku: 'NDL-MAG-70G',
        barcode: '8901058852334',
        category: 'Snacks & Packaged Food',
        brand: 'Nestle India',
        unit: 'packet',
        purchasePrice: 11.5,
        sellingPrice: 14,
        mrp: 14,
        stockQuantity: 6, // Low stock on purpose!
        lowStockThreshold: 25,
        gstRate: 12,
        hsnCode: '1902',
        batchNumber: 'MG-88',
        expiryDate: '2027-02-15',
        supplierId: 'sup-1',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-6',
        businessId: businessId1,
        name: 'Amul Butter Salted (500g)',
        sku: 'DAR-AMU-500G',
        barcode: '8901262010058',
        category: 'Dairy & Breakfast',
        brand: 'Amul',
        unit: 'packet',
        purchasePrice: 245,
        sellingPrice: 285,
        mrp: 290,
        stockQuantity: 4, // Very low stock!
        lowStockThreshold: 12,
        gstRate: 12,
        hsnCode: '0405',
        batchNumber: 'AM-412',
        expiryDate: '2026-11-20', // Near expiry
        supplierId: 'sup-3',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-7',
        businessId: businessId1,
        name: 'Brooke Bond Red Label Natural Care Tea (500g)',
        sku: 'TEA-RED-500G',
        barcode: '8901030825318',
        category: 'Beverages',
        brand: 'HUL Red Label',
        unit: 'packet',
        purchasePrice: 260,
        sellingPrice: 320,
        mrp: 340,
        stockQuantity: 34,
        lowStockThreshold: 10,
        gstRate: 5,
        hsnCode: '0902',
        batchNumber: 'RL-99',
        expiryDate: '2027-09-01',
        supplierId: 'sup-1',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-8',
        businessId: businessId1,
        name: 'Dettol Disinfectant Antiseptic Liquid (500ml)',
        sku: 'HYG-DET-500M',
        barcode: '8901396112000',
        category: 'Personal Care & Hygiene',
        brand: 'Reckitt',
        unit: 'bottle',
        purchasePrice: 195,
        sellingPrice: 235,
        mrp: 245,
        stockQuantity: 28,
        lowStockThreshold: 10,
        gstRate: 18,
        hsnCode: '3004',
        batchNumber: 'DT-102',
        expiryDate: '2028-05-10',
        supplierId: 'sup-1',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-9',
        businessId: businessId1,
        name: 'Surf Excel Quick Wash Detergent Powder (1kg)',
        sku: 'DET-SRF-01K',
        barcode: '8901030713004',
        category: 'Cleaning & Household',
        brand: 'HUL Surf Excel',
        unit: 'packet',
        purchasePrice: 165,
        sellingPrice: 205,
        mrp: 220,
        stockQuantity: 52,
        lowStockThreshold: 15,
        gstRate: 18,
        hsnCode: '3402',
        batchNumber: 'SX-43',
        expiryDate: '2028-08-30',
        supplierId: 'sup-1',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'prod-10',
        businessId: businessId1,
        name: 'Cadbury Dairy Milk Silk Chocolate (150g)',
        sku: 'CHO-CAD-150G',
        barcode: '8901233024013',
        category: 'Snacks & Packaged Food',
        brand: 'Mondelez',
        unit: 'pcs',
        purchasePrice: 140,
        sellingPrice: 175,
        mrp: 180,
        stockQuantity: 2, // Out of stock / critically low
        lowStockThreshold: 15,
        gstRate: 18,
        hsnCode: '1806',
        batchNumber: 'CD-77',
        expiryDate: '2027-01-10',
        supplierId: 'sup-2',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z'
      }
    ];

    // Customers
    this.data.customers = [
      {
        id: 'cust-1',
        businessId: businessId1,
        name: 'Pooja Agrawal',
        phone: '+91 98291 11223',
        email: 'pooja.agrawal@gmail.com',
        address: 'Plot 45, Mahaveer Nagar, Jaipur',
        loyaltyPoints: 340,
        creditBalance: 1200, // Khata credit
        totalPurchases: 28450,
        totalOrders: 24,
        lastPurchaseDate: '2026-10-28T16:30:00.000Z',
        createdAt: '2026-01-20T10:00:00.000Z'
      },
      {
        id: 'cust-2',
        businessId: businessId1,
        name: 'Dr. Vikram Malhotra',
        phone: '+91 94140 22334',
        email: 'drvikram@fortis.in',
        address: 'B-12, Officers Campus, Jaipur',
        loyaltyPoints: 680,
        creditBalance: 0,
        totalPurchases: 54100,
        totalOrders: 42,
        lastPurchaseDate: '2026-10-30T11:15:00.000Z',
        createdAt: '2026-01-18T10:00:00.000Z'
      },
      {
        id: 'cust-3',
        businessId: businessId1,
        name: 'Sunil Choudhary',
        phone: '+91 97850 66778',
        email: 'sunil.c@rediffmail.com',
        address: 'Near Gaurav Tower, Malviya Nagar',
        loyaltyPoints: 110,
        creditBalance: 2450, // Khata pending
        totalPurchases: 14200,
        totalOrders: 11,
        lastPurchaseDate: '2026-10-29T19:00:00.000Z',
        createdAt: '2026-02-05T10:00:00.000Z'
      },
      {
        id: 'cust-4',
        businessId: businessId1,
        name: 'Meenakshi Sundaram',
        phone: '+91 98840 99112',
        email: 'meenu.s@gmail.com',
        address: 'Flat 203, Royal Residency, Jaipur',
        loyaltyPoints: 215,
        creditBalance: 0,
        totalPurchases: 19800,
        totalOrders: 18,
        lastPurchaseDate: '2026-10-27T14:20:00.000Z',
        createdAt: '2026-02-12T10:00:00.000Z'
      }
    ];

    // Orders (realistic generation over the last 30 days)
    const baseOrders: Order[] = [];
    const today = new Date('2026-10-30T20:00:00.000Z');

    // Create 35 simulated orders over the past 30 days
    for (let i = 30; i >= 0; i--) {
      const orderDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const daySalesCount = (i % 3 === 0 ? 3 : 2); // 2-3 orders per day

      for (let j = 0; j < daySalesCount; j++) {
        const orderNum = `ORD-${2026000 + (30 - i) * 3 + j}`;
        const isCash = (j % 2 === 0);
        const method = isCash ? 'UPI' : (j % 3 === 0 ? 'Card' : 'Cash');
        const cust = this.data.customers[j % this.data.customers.length];

        const itemA = this.data.products[0];
        const itemB = this.data.products[1];
        const itemC = this.data.products[(i + j) % this.data.products.length];

        const qtyA = 1;
        const qtyB = 2;
        const qtyC = 1;

        const subtotal = itemA.sellingPrice * qtyA + itemB.sellingPrice * qtyB + itemC.sellingPrice * qtyC;
        const tax = Math.round(subtotal * 0.05);
        const discount = (subtotal > 1000 ? 50 : 0);
        const totalAmount = subtotal + tax - discount;

        baseOrders.push({
          id: `ord-${orderNum}`,
          orderNumber: orderNum,
          businessId: businessId1,
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          items: [
            {
              productId: itemA.id,
              productName: itemA.name,
              sku: itemA.sku,
              quantity: qtyA,
              unitPrice: itemA.sellingPrice,
              purchasePrice: itemA.purchasePrice,
              gstRate: itemA.gstRate,
              taxAmount: Math.round(itemA.sellingPrice * qtyA * (itemA.gstRate / 100)),
              total: itemA.sellingPrice * qtyA
            },
            {
              productId: itemB.id,
              productName: itemB.name,
              sku: itemB.sku,
              quantity: qtyB,
              unitPrice: itemB.sellingPrice,
              purchasePrice: itemB.purchasePrice,
              gstRate: itemB.gstRate,
              taxAmount: Math.round(itemB.sellingPrice * qtyB * (itemB.gstRate / 100)),
              total: itemB.sellingPrice * qtyB
            },
            {
              productId: itemC.id,
              productName: itemC.name,
              sku: itemC.sku,
              quantity: qtyC,
              unitPrice: itemC.sellingPrice,
              purchasePrice: itemC.purchasePrice,
              gstRate: itemC.gstRate,
              taxAmount: Math.round(itemC.sellingPrice * qtyC * (itemC.gstRate / 100)),
              total: itemC.sellingPrice * qtyC
            }
          ],
          subtotal,
          discount,
          taxAmount: tax,
          totalAmount,
          paymentMethod: method as any,
          paymentStatus: 'Paid',
          status: 'Completed',
          cashierName: 'Amit Verma',
          createdAt: new Date(orderDate.getTime() + (10 + j * 3) * 3600000).toISOString()
        });
      }
    }
    this.data.orders = baseOrders;

    // Expenses
    this.data.expenses = [
      {
        id: 'exp-1',
        businessId: businessId1,
        category: 'Rent',
        title: 'October Shop Commercial Rent',
        amount: 22000,
        paymentMethod: 'Bank Transfer',
        date: '2026-10-05',
        receiptNumber: 'RENT-OCT-26',
        createdAt: '2026-10-05T10:00:00.000Z'
      },
      {
        id: 'exp-2',
        businessId: businessId1,
        category: 'Electricity & Utilities',
        title: 'Jaipur Vidyut Vitran Nigam Bill',
        amount: 4850,
        paymentMethod: 'UPI',
        date: '2026-10-12',
        receiptNumber: 'JVVNL-44912',
        createdAt: '2026-10-12T10:00:00.000Z'
      },
      {
        id: 'exp-3',
        businessId: businessId1,
        category: 'Staff Wages',
        title: 'Monthly Helper & Delivery Wages',
        amount: 14000,
        paymentMethod: 'Cash',
        date: '2026-10-07',
        notes: 'Paid to Raju and Mahesh',
        createdAt: '2026-10-07T10:00:00.000Z'
      },
      {
        id: 'exp-4',
        businessId: businessId1,
        category: 'Packaging & Freight',
        title: 'Biodegradable carry bags and packing tapes',
        amount: 2300,
        paymentMethod: 'UPI',
        date: '2026-10-20',
        createdAt: '2026-10-20T10:00:00.000Z'
      }
    ];

    // Purchases
    this.data.purchases = [
      {
        id: 'pur-1',
        purchaseNumber: 'PO-2026-081',
        businessId: businessId1,
        supplierId: 'sup-1',
        supplierName: 'Hindustan Unilever Distributor (HUL)',
        items: [
          {
            productId: 'prod-2',
            productName: 'Fortune Sunlite Refined Sunflower Oil (1L)',
            quantity: 50,
            unitCost: 125,
            total: 6250
          },
          {
            productId: 'prod-9',
            productName: 'Surf Excel Quick Wash Detergent Powder (1kg)',
            quantity: 40,
            unitCost: 165,
            total: 6600
          }
        ],
        totalAmount: 12850,
        paidAmount: 12850,
        paymentStatus: 'Paid',
        status: 'Received',
        invoiceNumber: 'HUL-INV-9902',
        purchaseDate: '2026-10-18',
        createdAt: '2026-10-18T10:00:00.000Z'
      },
      {
        id: 'pur-2',
        purchaseNumber: 'PO-2026-088',
        businessId: businessId1,
        supplierId: 'sup-2',
        supplierName: 'ITC Wholesale Depot',
        items: [
          {
            productId: 'prod-1',
            productName: 'Aashirvaad Shudh Chakki Atta (10kg)',
            quantity: 30,
            unitCost: 410,
            total: 12300
          }
        ],
        totalAmount: 12300,
        paidAmount: 0,
        paymentStatus: 'Pending',
        status: 'Received',
        invoiceNumber: 'ITC-7811',
        purchaseDate: '2026-10-26',
        createdAt: '2026-10-26T10:00:00.000Z'
      }
    ];

    // Notifications
    this.data.notifications = [
      {
        id: 'notif-1',
        businessId: businessId1,
        type: 'low_stock',
        title: 'Critical Stock Alert: Maggi Noodles',
        message: 'Only 6 packets of Maggi 2-Minute Masala remaining. Minimum threshold is 25.',
        read: false,
        timestamp: '2026-10-30T18:00:00.000Z',
        link: '/inventory'
      },
      {
        id: 'notif-2',
        businessId: businessId1,
        type: 'expiry',
        title: 'Upcoming Expiry Warning',
        message: 'Amul Butter Salted (500g) Batch AM-412 expires within 25 days (20 Nov 2026).',
        read: false,
        timestamp: '2026-10-30T10:00:00.000Z',
        link: '/inventory'
      },
      {
        id: 'notif-3',
        businessId: businessId1,
        type: 'payment',
        title: 'Pending Supplier Payment Due',
        message: '₹12,300 payable to ITC Wholesale Depot for PO-2026-088 due shortly.',
        read: true,
        timestamp: '2026-10-29T14:00:00.000Z',
        link: '/suppliers'
      }
    ];

    // Audit logs
    this.data.auditLogs = [
      {
        id: 'aud-1',
        businessId: businessId1,
        userId: ownerId1,
        userName: 'Rajesh Sharma',
        userRole: 'Business Owner',
        action: 'STOCK_ADJUSTED',
        severity: 'info',
        entityType: 'inventory',
        entityId: 'prod-2',
        details: 'Received 50 units of Fortune Sunflower Oil from HUL Distributor',
        oldValue: { stockQuantity: 15 },
        newValue: { stockQuantity: 65 },
        ipAddress: '192.168.1.10 (Backoffice PC)',
        timestamp: '2026-10-18T10:30:00.000Z'
      },
      {
        id: 'aud-2',
        businessId: businessId1,
        userId: 'user-amit-cashier',
        userName: 'Amit Verma',
        userRole: 'Cashier',
        action: 'ORDER_CREATED',
        severity: 'info',
        entityType: 'order',
        entityId: 'ord-ORD-2026090',
        details: 'Generated POS Invoice #ORD-2026090 for Dr. Vikram Malhotra (₹1,258)',
        newValue: { orderNumber: 'ORD-2026090', totalAmount: 1258, paymentMethod: 'UPI' },
        ipAddress: '192.168.1.25 (Counter POS #1)',
        timestamp: '2026-10-31T06:00:00.000Z'
      },
      {
        id: 'aud-3',
        businessId: businessId1,
        userId: ownerId1,
        userName: 'Rajesh Sharma',
        userRole: 'Business Owner',
        action: 'PRODUCT_DELETED',
        severity: 'critical',
        entityType: 'product',
        entityId: 'prod-legacy-7',
        details: 'Permanently deleted discontinued item: Limca Fresh Lime Soda Can (300ml)',
        oldValue: { name: 'Limca Fresh Lime Soda Can (300ml)', sku: 'BEV-LIM-300M', stockQuantity: 0 },
        ipAddress: '192.168.1.10 (Backoffice PC)',
        timestamp: '2026-10-29T16:45:00.000Z'
      },
      {
        id: 'aud-4',
        businessId: businessId1,
        userId: ownerId1,
        userName: 'Rajesh Sharma',
        userRole: 'Business Owner',
        action: 'ORDER_REFUNDED',
        severity: 'critical',
        entityType: 'order',
        entityId: 'ord-ORD-2026079',
        details: 'Processed customer return and refunded ₹475 for Bill #ORD-2026079. Stock restored for Aashirvaad Atta (10kg).',
        oldValue: { status: 'Completed', totalAmount: 475 },
        newValue: { status: 'Refunded', restoredQty: 1 },
        ipAddress: '192.168.1.10 (Backoffice PC)',
        timestamp: '2026-10-27T14:15:00.000Z'
      },
      {
        id: 'aud-5',
        businessId: businessId1,
        userId: ownerId1,
        userName: 'Rajesh Sharma',
        userRole: 'Business Owner',
        action: 'PRICE_MODIFIED',
        severity: 'warning',
        entityType: 'product',
        entityId: 'prod-4',
        details: 'Updated selling price of India Gate Basmati Rice Feast (5kg) from ₹440 to ₹460',
        oldValue: { sellingPrice: 440 },
        newValue: { sellingPrice: 460 },
        ipAddress: '192.168.1.10 (Backoffice PC)',
        timestamp: '2026-10-25T11:20:00.000Z'
      },
      {
        id: 'aud-6',
        businessId: businessId1,
        userId: 'user-amit-cashier',
        userName: 'Amit Verma',
        userRole: 'Cashier',
        action: 'KHATA_SETTLED',
        severity: 'info',
        entityType: 'customer',
        entityId: 'cust-1',
        details: 'Collected ₹1,500 cash payment towards Khata balance from Pooja Agrawal',
        oldValue: { creditBalance: 2700 },
        newValue: { creditBalance: 1200 },
        ipAddress: '192.168.1.25 (Counter POS #1)',
        timestamp: '2026-10-28T17:30:00.000Z'
      }
    ];
  }

  // --- User & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Business ---
  public getBusinesses(): Business[] {
    return this.data.businesses;
  }

  public getBusinessById(id: string): Business | undefined {
    return this.data.businesses.find(b => b.id === id);
  }

  public createBusiness(biz: Business): Business {
    this.data.businesses.push(biz);
    this.save();
    return biz;
  }

  public updateBusiness(id: string, updates: Partial<Business>): Business | undefined {
    const idx = this.data.businesses.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    this.data.businesses[idx] = { ...this.data.businesses[idx], ...updates };
    this.save();
    return this.data.businesses[idx];
  }

  // --- Products ---
  public getProducts(businessId: string): Product[] {
    return this.data.products.filter(p => p.businessId === businessId);
  }

  public getProductById(id: string, businessId: string): Product | undefined {
    return this.data.products.find(p => p.id === id && p.businessId === businessId);
  }

  public createProduct(product: Product): Product {
    this.data.products.push(product);
    this.save();
    return product;
  }

  public updateProduct(id: string, businessId: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id && p.businessId === businessId);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string, businessId: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => !(p.id === id && p.businessId === businessId));
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Deduct stock for sold items
  public deductProductStock(productId: string, businessId: string, qty: number): Product | undefined {
    const prod = this.getProductById(productId, businessId);
    if (prod) {
      prod.stockQuantity = Math.max(0, prod.stockQuantity - qty);
      prod.updatedAt = new Date().toISOString();
      this.save();
      return prod;
    }
    return undefined;
  }

  // Restore stock on order cancellation
  public restoreProductStock(productId: string, businessId: string, qty: number): Product | undefined {
    const prod = this.getProductById(productId, businessId);
    if (prod) {
      prod.stockQuantity += qty;
      prod.updatedAt = new Date().toISOString();
      this.save();
      return prod;
    }
    return undefined;
  }

  // --- Orders ---
  public getOrders(businessId: string): Order[] {
    return this.data.orders.filter(o => o.businessId === businessId);
  }

  public getOrderById(id: string, businessId: string): Order | undefined {
    return this.data.orders.find(o => o.id === id && o.businessId === businessId);
  }

  public createOrder(order: Order): Order {
    this.data.orders.push(order);
    this.save();
    return order;
  }

  public updateOrderStatus(id: string, businessId: string, status: 'Completed' | 'Cancelled' | 'Refunded'): Order | undefined {
    const order = this.getOrderById(id, businessId);
    if (order) {
      const prevStatus = order.status;
      order.status = status;
      // If cancelled or refunded and was previously completed, restore stock!
      if ((status === 'Cancelled' || status === 'Refunded') && prevStatus === 'Completed') {
        for (const item of order.items) {
          this.restoreProductStock(item.productId, businessId, item.quantity);
        }
      }
      this.save();
      return order;
    }
    return undefined;
  }

  // --- Customers ---
  public getCustomers(businessId: string): Customer[] {
    return this.data.customers.filter(c => c.businessId === businessId);
  }

  public getCustomerById(id: string, businessId: string): Customer | undefined {
    return this.data.customers.find(c => c.id === id && c.businessId === businessId);
  }

  public createCustomer(cust: Customer): Customer {
    this.data.customers.push(cust);
    this.save();
    return cust;
  }

  public updateCustomer(id: string, businessId: string, updates: Partial<Customer>): Customer | undefined {
    const idx = this.data.customers.findIndex(c => c.id === id && c.businessId === businessId);
    if (idx === -1) return undefined;
    this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
    this.save();
    return this.data.customers[idx];
  }

  // --- Suppliers ---
  public getSuppliers(businessId: string): Supplier[] {
    return this.data.suppliers.filter(s => s.businessId === businessId);
  }

  public createSupplier(supplier: Supplier): Supplier {
    this.data.suppliers.push(supplier);
    this.save();
    return supplier;
  }

  public updateSupplier(id: string, businessId: string, updates: Partial<Supplier>): Supplier | undefined {
    const idx = this.data.suppliers.findIndex(s => s.id === id && s.businessId === businessId);
    if (idx === -1) return undefined;
    this.data.suppliers[idx] = { ...this.data.suppliers[idx], ...updates };
    this.save();
    return this.data.suppliers[idx];
  }

  // --- Purchases ---
  public getPurchases(businessId: string): Purchase[] {
    return this.data.purchases.filter(p => p.businessId === businessId);
  }

  public createPurchase(purchase: Purchase): Purchase {
    this.data.purchases.push(purchase);
    // Automatically increment stock if status is Received!
    if (purchase.status === 'Received') {
      for (const item of purchase.items) {
        this.restoreProductStock(item.productId, purchase.businessId, item.quantity);
      }
    }
    this.save();
    return purchase;
  }

  // --- Expenses ---
  public getExpenses(businessId: string): Expense[] {
    return this.data.expenses.filter(e => e.businessId === businessId);
  }

  public createExpense(expense: Expense): Expense {
    this.data.expenses.push(expense);
    this.save();
    return expense;
  }

  public deleteExpense(id: string, businessId: string): boolean {
    const len = this.data.expenses.length;
    this.data.expenses = this.data.expenses.filter(e => !(e.id === id && e.businessId === businessId));
    if (this.data.expenses.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Notifications ---
  public getNotifications(businessId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.businessId === businessId);
  }

  public markNotificationAsRead(id: string, businessId: string): void {
    const item = this.data.notifications.find(n => n.id === id && n.businessId === businessId);
    if (item) {
      item.read = true;
      this.save();
    }
  }

  public createNotification(n: NotificationItem): void {
    this.data.notifications.unshift(n);
    this.save();
  }

  // --- Audit Logs ---
  public getAuditLogs(businessId: string): AuditLog[] {
    return this.data.auditLogs.filter(a => a.businessId === businessId);
  }

  public logAudit(log: AuditLog): void {
    this.data.auditLogs.unshift(log);
    this.save();
  }

  // --- Super Admin Overview ---
  public getAdminStats() {
    return {
      totalBusinesses: this.data.businesses.length,
      totalUsers: this.data.users.length,
      totalOrders: this.data.orders.length,
      totalPlatformGMV: this.data.orders.reduce((sum, o) => sum + (o.status === 'Completed' ? o.totalAmount : 0), 0),
      businesses: this.data.businesses,
      users: this.data.users.map(({ passwordHash, ...rest }) => rest)
    };
  }
}

export const db = new DatabaseManager();
