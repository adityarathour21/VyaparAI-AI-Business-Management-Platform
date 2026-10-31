import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Supplier, Purchase, Product } from '../types';
import {
  Truck,
  Plus,
  IndianRupee,
  Phone,
  FileCheck,
  PackagePlus,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const Suppliers: React.FC = () => {
  const { business } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showInwardModal, setShowInwardModal] = useState(false);

  // Supplier Form
  const [newSup, setNewSup] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    pendingBalance: 0
  });

  // Stock Inward Form
  const [inwardData, setInwardData] = useState({
    supplierId: '',
    productId: '',
    quantity: 10,
    unitCost: 100,
    paidAmount: 1000,
    invoiceNumber: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sups, purs, prods] = await Promise.all([
        api.getSuppliers(),
        api.getPurchases(),
        api.getProducts()
      ]);
      setSuppliers(sups);
      setPurchases(purs);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load supplier data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const totalPendingSupplier = suppliers.reduce((sum, s) => sum + (s.pendingBalance || 0), 0);
  const totalPurchasesVolume = suppliers.reduce((sum, s) => sum + (s.totalPurchased || 0), 0);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupplier(newSup);
      setShowAddSupplierModal(false);
      setNewSup({ name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '', pendingBalance: 0 });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create supplier');
    }
  };

  const handleStockInward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardData.supplierId || !inwardData.productId) {
      alert('Please select both supplier and product');
      return;
    }

    const sup = suppliers.find(s => s.id === inwardData.supplierId);
    const prod = products.find(p => p.id === inwardData.productId);

    const totalAmt = inwardData.quantity * inwardData.unitCost;

    try {
      await api.createPurchase({
        supplierId: inwardData.supplierId,
        supplierName: sup?.name || 'Wholesale Supplier',
        items: [
          {
            productId: inwardData.productId,
            productName: prod?.name || 'Product',
            quantity: Number(inwardData.quantity),
            unitCost: Number(inwardData.unitCost),
            total: totalAmt
          }
        ],
        totalAmount: totalAmt,
        paidAmount: Number(inwardData.paidAmount),
        paymentStatus: Number(inwardData.paidAmount) >= totalAmt ? 'Paid' : 'Partial',
        status: 'Received',
        invoiceNumber: inwardData.invoiceNumber
      });

      setShowInwardModal(false);
      setInwardData({ supplierId: '', productId: '', quantity: 10, unitCost: 100, paidAmount: 1000, invoiceNumber: '' });
      loadData();
      alert(`Stock inward recorded! Inventory for ${prod?.name} increased by ${inwardData.quantity} units.`);
    } catch (err: any) {
      alert(err.message || 'Stock inward failed');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Suppliers & Stock Inward Purchases
          </h1>
          <p className="text-xs text-slate-500">
            Wholesale distributor accounts, purchase orders & automated inventory restock inward
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
          >
            + Add Supplier
          </button>
          <button
            onClick={() => setShowInwardModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <PackagePlus className="w-4 h-4" />
            + New Stock Inward (Restock)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Pending Supplier Payables</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            ₹{totalPendingSupplier.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">Wholesale dues to settle</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Active Distributors & Mandis</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {suppliers.length}
          </p>
          <span className="text-[10px] text-slate-400">Verified trade partners</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Purchase Volume</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{totalPurchasesVolume.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">Procured stock volume</span>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Wholesale Suppliers Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Supplier Firm Name</th>
                <th className="py-3 px-3">Contact Person & Phone</th>
                <th className="py-3 px-3">GSTIN & City</th>
                <th className="py-3 px-3 text-right">Total Purchased</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-white leading-tight">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.email || 'wholesale@depot.in'}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <p className="font-medium">{s.contactPerson || 'Store Manager'}</p>
                    <p className="font-mono text-[11px] text-slate-400">{s.phone}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    <p className="font-mono text-[11px]">{s.gstin || 'Composition / Exempted'}</p>
                    <p className="text-[10px] text-slate-400">{s.address || 'Local Mandi'}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-white">
                    ₹{s.totalPurchased.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {s.pendingBalance > 0 ? (
                      <span className="text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                        ₹{s.pendingBalance.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-600">₹0 (Paid)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Inward Purchases History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Recent Purchase Orders (Inward Stock)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">PO Number & Date</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3">Items Procured</th>
                <th className="py-3 px-3 text-right">Bill Total</th>
                <th className="py-3 px-4 text-right">Inward Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-slate-800 dark:text-white">{p.purchaseNumber}</p>
                    <p className="text-[10px] text-slate-400">{p.purchaseDate}</p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{p.supplierName}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {p.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{p.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      ✓ Stock Received & Added
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Inward Restock Modal */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleStockInward} className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-emerald-600" />
                Record Stock Inward & Restock Inventory
              </span>
              <button type="button" onClick={() => setShowInwardModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Supplier *</label>
                <select
                  required
                  value={inwardData.supplierId}
                  onChange={(e) => setInwardData({ ...inwardData, supplierId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-none"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Product to Restock *</label>
                <select
                  required
                  value={inwardData.productId}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    setInwardData({
                      ...inwardData,
                      productId: e.target.value,
                      unitCost: prod ? prod.purchasePrice : inwardData.unitCost
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-none"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Received</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inwardData.quantity}
                    onChange={(e) => setInwardData({ ...inwardData, quantity: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={inwardData.unitCost}
                    onChange={(e) => setInwardData({ ...inwardData, unitCost: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg text-xs flex justify-between font-bold">
                <span>Total PO Cost:</span>
                <span className="text-emerald-700">₹{inwardData.quantity * inwardData.unitCost}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier Invoice Number</label>
                <input
                  type="text"
                  placeholder="e.g. HUL-2026-INV-99"
                  value={inwardData.invoiceNumber}
                  onChange={(e) => setInwardData({ ...inwardData, invoiceNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={inwardData.paidAmount}
                  onChange={(e) => setInwardData({ ...inwardData, paidAmount: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md"
            >
              Confirm Inward & Add Stock to Inventory
            </button>
          </form>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSupplier} className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">Add Wholesale Supplier</span>
              <button type="button" onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Distributor / Supplier Firm *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITC Wholesale Depot"
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sanjay Agarwal"
                  value={newSup.contactPerson}
                  onChange={(e) => setNewSup({ ...newSup, contactPerson: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 94140 00000"
                  value={newSup.phone}
                  onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 08AABCI8989G1Z8"
                  value={newSup.gstin}
                  onChange={(e) => setNewSup({ ...newSup, gstin: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Depot / Mandi Address</label>
                <input
                  type="text"
                  placeholder="e.g. Anaj Mandi, Chandpole"
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
            >
              Save Supplier Partner
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
