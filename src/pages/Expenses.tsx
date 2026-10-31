import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Expense, DashboardMetrics } from '../types';
import {
  Wallet,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Receipt,
  IndianRupee,
  Calendar,
  X,
  PieChart as PieIcon
} from 'lucide-react';

export const Expenses: React.FC = () => {
  const { business } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'Rent',
    title: '',
    amount: 0,
    paymentMethod: 'Cash',
    date: new Date().toISOString().slice(0, 10),
    receiptNumber: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [exps, dash] = await Promise.all([
        api.getExpenses(),
        api.getDashboardStats()
      ]);
      setExpenses(exps);
      setMetrics(dash.metrics);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const totalExpenseAmt = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    try {
      await api.createExpense(formData);
      setShowAddModal(false);
      setFormData({
        category: 'Rent',
        title: '',
        amount: 0,
        paymentMethod: 'Cash',
        date: new Date().toISOString().slice(0, 10),
        receiptNumber: '',
        notes: ''
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this expense entry?')) {
      await api.deleteExpense(id);
      loadData();
    }
  };

  // P&L Metrics
  const grossRev = metrics?.totalRevenue || 0;
  const grossProf = metrics?.grossProfit || 0;
  const netProf = grossProf - totalExpenseAmt;
  const grossMargin = grossRev > 0 ? ((grossProf / grossRev) * 100).toFixed(1) : '0';
  const netMargin = grossRev > 0 ? ((netProf / grossRev) * 100).toFixed(1) : '0';

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600" />
            Financial Management & Profit/Loss Statement
          </h1>
          <p className="text-xs text-slate-500">
            Track overhead costs, shop rent, staff wages, utilities & complete P&L analytics
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          + Record Expense
        </button>
      </div>

      {/* Profit & Loss Executive Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Official Store P&L Breakdown
          </span>
          <span className="text-[11px] text-slate-400">Current Financial Period</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-slate-400">Gross Sales Revenue</span>
            <p className="text-xl md:text-2xl font-black text-white mt-1">₹{grossRev.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-400">POS Receipts</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400">Gross Margin (After COGS)</span>
            <p className="text-xl md:text-2xl font-black text-indigo-300 mt-1">₹{grossProf.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-indigo-400">{grossMargin}% Gross Margin</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400">Operating Expenses</span>
            <p className="text-xl md:text-2xl font-black text-rose-400 mt-1">₹{totalExpenseAmt.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-rose-300">{expenses.length} Logged Entries</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-emerald-300 font-semibold">Net Profit (Take-Home)</span>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-1">₹{netProf.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-300">{netMargin}% Net Margin</span>
          </div>
        </div>
      </div>

      {/* Expenses Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Store Expense Register</h3>
          <span className="text-xs text-slate-500 font-medium">Total: ₹{totalExpenseAmt.toLocaleString('en-IN')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Expense Category</th>
                <th className="py-3 px-3">Expense Title / Description</th>
                <th className="py-3 px-3">Payment Mode</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No expense records yet
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{e.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800 dark:text-white">{e.title}</p>
                      {e.notes && <p className="text-[10px] text-slate-400">{e.notes}</p>}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{e.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                      ₹{e.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">Record Store Expense</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                >
                  <option value="Rent">Shop Rent</option>
                  <option value="Electricity & Utilities">Electricity & Utilities</option>
                  <option value="Staff Wages">Staff / Helper Wages</option>
                  <option value="Packaging & Freight">Packaging & Carry Bags</option>
                  <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                  <option value="Marketing">Local Marketing & Pamphlets</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title / Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Electricity Bill"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Paid (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 2500"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Receipt / Voucher Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RCP-881"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
            >
              Save Expense to Books
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
