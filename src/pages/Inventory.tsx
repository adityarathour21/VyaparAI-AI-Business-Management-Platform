import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { business } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'lowStock' | 'nearExpiry'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Grocery / Kirana',
    brand: '',
    unit: 'pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    stockQuantity: 10,
    lowStockThreshold: 5,
    gstRate: 5,
    hsnCode: '',
    batchNumber: '',
    expiryDate: ''
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [business?.id]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;

    if (filterType === 'lowStock') {
      return matchesSearch && matchesCat && p.stockQuantity <= p.lowStockThreshold;
    }
    if (filterType === 'nearExpiry') {
      if (!p.expiryDate) return false;
      const expiry = new Date(p.expiryDate).getTime();
      const thirtyDays = Date.now() + 60 * 24 * 3600 * 1000;
      return matchesSearch && matchesCat && expiry <= thirtyDays;
    }
    return matchesSearch && matchesCat;
  });

  // Inventory valuation
  const totalItems = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + p.stockQuantity * p.sellingPrice, 0);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: `${Math.floor(8900000000000 + Math.random() * 999999999)}`,
      category: 'Grocery / Kirana',
      brand: '',
      unit: 'pcs',
      purchasePrice: 0,
      sellingPrice: 0,
      mrp: 0,
      stockQuantity: 20,
      lowStockThreshold: 5,
      gstRate: 5,
      hsnCode: '',
      batchNumber: '',
      expiryDate: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setShowAddModal(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      try {
        await api.deleteProduct(id);
        loadProducts();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Unit', 'PurchasePrice', 'SellingPrice', 'MRP', 'Stock', 'Threshold', 'GST_Rate'];
    const rows = products.map(p => [
      `"${p.name}"`,
      p.sku,
      p.barcode,
      `"${p.category}"`,
      p.unit,
      p.purchasePrice,
      p.sellingPrice,
      p.mrp,
      p.stockQuantity,
      p.lowStockThreshold,
      p.gstRate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_${business?.name || 'store'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Valuation Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            Smart Inventory Management
          </h1>
          <p className="text-xs text-slate-500">
            Real-time stock tracking, barcode labels, GST rates, batch expiry & valuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Valuation Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Stock in Hand</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalItems.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">units across {products.length} items</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Inventory Cost Value</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{totalCostValuation.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Potential Retail Value</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalRetailValuation.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl w-full sm:w-auto text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setFilterType('lowStock')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                filterType === 'lowStock'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Alerts ({products.filter(p => p.stockQuantity <= p.lowStockThreshold).length})
            </button>
            <button
              onClick={() => setFilterType('nearExpiry')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterType === 'nearExpiry'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50'
              }`}
            >
              Near Expiry
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, barcode, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Pill filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3">SKU / Barcode</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-right">GST %</th>
                <th className="py-3 px-3 text-center">Stock Level</th>
                <th className="py-3 px-3">Batch / Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No products found matching filters
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  const isOut = p.stockQuantity <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 dark:text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.brand || 'Local Merchant'}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div>{p.sku}</div>
                        <div className="text-[10px] text-slate-400">{p.barcode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono">₹{p.purchasePrice}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        ₹{p.sellingPrice}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{p.gstRate}%</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                        {isLow && !isOut && (
                          <span className="block text-[9px] text-amber-600 font-medium">Reorder soon</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        <div>{p.batchNumber ? `B: ${p.batchNumber}` : '—'}</div>
                        <div className="text-[10px] text-slate-400">{p.expiryDate ? `Exp: ${p.expiryDate}` : ''}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                {editingProduct ? 'Edit Product SKU' : 'Add New Inventory SKU'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Tea Gold (500g)"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Beverages, Dairy, Grains"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tata, Nestle, Amul"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">SKU Code</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Barcode (EAN-13)</label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Unit of Measure</label>
                <select
                  value={formData.unit || 'pcs'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="packet">Packet (pkt)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="bottle">Bottle</option>
                  <option value="strip">Medicine Strip</option>
                  <option value="box">Box</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">GST Tax Rate</label>
                <select
                  value={formData.gstRate || 0}
                  onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none"
                >
                  <option value={0}>0% (Exempted)</option>
                  <option value={5}>5% (Essential FMCG/Food)</option>
                  <option value={12}>12% (Processed items)</option>
                  <option value={18}>18% (Standard GST)</option>
                  <option value={28}>28% (Luxury / Aerated)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Purchase Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.sellingPrice || ''}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white font-mono outline-none font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Initial Stock Qty</label>
                <input
                  type="number"
                  value={formData.stockQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold || ''}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. B-2026-X"
                  value={formData.batchNumber || ''}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all mt-2"
            >
              {editingProduct ? 'Update Product Details' : 'Save Product to Inventory'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
