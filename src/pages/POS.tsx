import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product, Customer, Order } from '../types';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  QrCode,
  CreditCard,
  Banknote,
  Users,
  CheckCircle2,
  X,
  Receipt,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface POSProps {
  onOrderCompleted: (order: Order) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const POS: React.FC<POSProps> = ({ onOrderCompleted }) => {
  const { business } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Credit / Khata'>('UPI');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const loadData = async () => {
    try {
      const [prods, custs] = await Promise.all([
        api.getProducts(),
        api.getCustomers()
      ]);
      setProducts(prods);
      setCustomers(custs);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Barcode Scan / Enter key auto-add
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const exactMatch = products.find(
        p => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery('');
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Subtotal & GST Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const totalTax = cart.reduce((sum, item) => {
    const lineTotal = item.product.sellingPrice * item.quantity;
    return sum + Math.round(lineTotal * (item.product.gstRate / 100));
  }, 0);
  const grandTotal = Math.max(0, subtotal + totalTax - (discount || 0));

  const changeDue = Math.max(0, (Number(cashTendered) || 0) - grandTotal);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      return;
    }
    const c = customers.find(cust => cust.id === custId);
    if (c) {
      setCustomerName(c.name);
      setCustomerPhone(c.phone);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    try {
      const created = await api.createCustomer({ name: newCustName, phone: newCustPhone });
      setCustomers(prev => [...prev, created]);
      setSelectedCustomerId(created.id);
      setCustomerName(created.name);
      setCustomerPhone(created.phone);
      setShowAddCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
    } catch (err) {
      console.error('Error creating customer:', err);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const order = await api.checkoutOrder({
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice
        })),
        customerId: selectedCustomerId || undefined,
        customerName,
        customerPhone,
        discount,
        paymentMethod
      });

      // Reset cart
      setCart([]);
      setDiscount(0);
      setCashTendered('');
      setSelectedCustomerId('');
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      setShowUPIModal(false);

      // Refresh products for updated stock
      loadData();

      // Trigger invoice modal
      onOrderCompleted(order);
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Left: Product Catalog & Search */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Search & Barcode Scan bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search product name, or scan barcode / enter SKU & press Enter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Barcode className="w-5 h-5 text-indigo-500 absolute right-3 top-2.5" />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(product => {
            const isLowStock = product.stockQuantity <= product.lowStockThreshold;
            const isOutOfStock = product.stockQuantity <= 0;
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isOutOfStock
                    ? 'border-slate-200 bg-slate-100 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]">
                      {product.sku}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      GST {product.gstRate}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{product.brand || product.category}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      ₹{product.sellingPrice}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-[10px] text-slate-400 line-through ml-1">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isOutOfStock
                        ? 'bg-rose-100 text-rose-600'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isOutOfStock ? 'Out of stock' : `${product.stockQuantity} ${product.unit}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Cart, Customer & Checkout Sidebar */}
      <div className="w-full md:w-96 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Customer Select Header */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Customer / Khata
            </span>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="text-[11px] text-indigo-600 font-semibold hover:underline"
            >
              + Add Customer
            </button>
          </div>

          <select
            value={selectedCustomerId}
            onChange={handleCustomerSelect}
            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">Walk-in Customer (Standard Retail)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) {c.creditBalance > 0 ? `• Khata: ₹${c.creditBalance}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-3.5 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Your Cart is Empty</p>
              <p className="text-[11px] text-slate-400 mt-1">Click products on left or scan barcode to add items</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-slate-800 dark:text-white line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ₹{item.product.sellingPrice} x {item.quantity} = <span className="font-semibold text-slate-700 dark:text-slate-300">₹{item.product.sellingPrice * item.quantity}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Payment Modes */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-750 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Bill Totals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated GST Tax:</span>
              <span>₹{totalTax}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                placeholder="0"
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-20 text-right px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-600">
              <span>Net Payable:</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-base">₹{grandTotal}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Payment Method
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(['UPI', 'Cash', 'Card', 'Credit / Khata'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all text-center ${
                    paymentMethod === mode
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {mode === 'Credit / Khata' ? 'Khata' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Tendered Calculator */}
          {paymentMethod === 'Cash' && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-amber-800 dark:text-amber-300 font-medium">Cash Received:</span>
                <input
                  type="number"
                  placeholder={`₹${grandTotal}`}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 rounded text-right font-bold text-xs"
                />
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Return Change:</span>
                <span>₹{changeDue}</span>
              </div>
            </div>
          )}

          {/* UPI QR Display Trigger */}
          {paymentMethod === 'UPI' && (
            <button
              onClick={() => setShowUPIModal(true)}
              className="w-full py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
            >
              <QrCode className="w-3.5 h-3.5" />
              Show Dynamic UPI QR Code (₹{grandTotal})
            </button>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              cart.length === 0 || isSubmitting
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{isSubmitting ? 'Generating Invoice...' : `Complete Bill & Print (₹${grandTotal})`}</span>
          </button>
        </div>
      </div>

      {/* Dynamic UPI QR Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">Scan & Pay via UPI</span>
              <button onClick={() => setShowUPIModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl flex flex-col items-center justify-center">
              {/* Simulated QR graphic */}
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-200 shadow-md flex flex-col items-center justify-center">
                <QrCode className="w-36 h-36 text-indigo-900" />
                <span className="text-[10px] font-mono text-slate-500 mt-1">UPI ID: sharmakirana@upi</span>
              </div>
              <p className="text-base font-black text-slate-900 mt-3">₹{grandTotal}</p>
              <p className="text-[11px] text-slate-500">Supports GPay, PhonePe, Paytm, BHIM</p>
            </div>

            <button
              onClick={() => {
                setShowUPIModal(false);
                handleCheckout();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Payment Received • Print Bill
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">Add Customer to Khata</span>
              <button type="button" onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Number (for WhatsApp Invoice)</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98290 00000"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
            >
              Save Customer & Apply
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
