import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types';
import {
  Users,
  Plus,
  Search,
  IndianRupee,
  Phone,
  MessageSquare,
  CheckCircle2,
  X,
  CreditCard,
  History
} from 'lucide-react';

export const Customers: React.FC = () => {
  const { business } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [khataOnly, setKhataOnly] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [settlingCustomer, setSettlingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');

  // Form states
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditBalance: 0
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [business?.id]);

  const totalKhataDue = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    if (khataOnly) {
      return matchesSearch && c.creditBalance > 0;
    }
    return matchesSearch;
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setShowAddModal(false);
      setNewCust({ name: '', phone: '', email: '', address: '', creditBalance: 0 });
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to add customer');
    }
  };

  const handleSettlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingCustomer || paymentAmount <= 0) return;

    try {
      await api.recordKhataPayment(settlingCustomer.id, paymentAmount, paymentMethod);
      setSettlingCustomer(null);
      setPaymentAmount(0);
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    }
  };

  const openWhatsAppReminder = (c: Customer) => {
    const text = `Namaste ${c.name} ji! Greetings from ${business?.name}. This is a gentle reminder that your pending store Khata credit balance is ₹${c.creditBalance}. Kindly settle it via UPI or cash at your convenience. Dhanyawad!`;
    const url = `https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Customer CRM & Digital Khata (उधार बहीखाता)
          </h1>
          <p className="text-xs text-slate-500">
            Track customer profiles, digital Khata credit balances, loyalty points & WhatsApp reminders
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Khata (Udhaar) to Collect</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ₹{totalKhataDue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">From {customers.filter(c => c.creditBalance > 0).length} customers</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Registered Customers</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {customers.length}
          </p>
          <span className="text-[10px] text-slate-400">Active retail accounts</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Loyalty Rewards Distributed</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {totalLoyaltyPoints.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Pts</span>
          </p>
          <span className="text-[10px] text-slate-400">Increases repeat footfall</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKhataOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              !khataOnly
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setKhataOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              khataOnly
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-rose-600 dark:text-rose-400'
            }`}
          >
            Pending Khata Dues ({customers.filter(c => c.creditBalance > 0).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-xs outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-3">Phone & Address</th>
                <th className="py-3 px-3 text-right">Lifetime Spend</th>
                <th className="py-3 px-3 text-center">Loyalty Points</th>
                <th className="py-3 px-3 text-right">Khata Credit Due</th>
                <th className="py-3 px-4 text-right">Khata Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No customers found matching search
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-white leading-tight">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.totalOrders} total bills completed</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div className="font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{c.address || 'Local Resident'}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-white">
                      ₹{c.totalPurchases.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        ★ {c.loyaltyPoints}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {c.creditBalance > 0 ? (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                          ₹{c.creditBalance.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-[11px]">₹0 (Clear)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.creditBalance > 0 && (
                          <>
                            <button
                              onClick={() => {
                                setSettlingCustomer(c);
                                setPaymentAmount(c.creditBalance);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm"
                            >
                              Collect Cash
                            </button>
                            <button
                              onClick={() => openWhatsAppReminder(c)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px]"
                              title="Send WhatsApp Payment Reminder"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Khata Payment Modal */}
      {settlingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSettlePayment} className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">
                Collect Khata Payment: {settlingCustomer.name}
              </span>
              <button type="button" onClick={() => setSettlingCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Due Balance:</span>
                <span className="font-bold text-rose-600">₹{settlingCustomer.creditBalance}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={settlingCustomer.creditBalance}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-sm text-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
            >
              Confirm Settlement & Update Ledger
            </button>
          </form>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm text-slate-800">Add New Customer Account</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meenakshi Sundaram"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Phone (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98290 00000"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address / Colony</label>
                <input
                  type="text"
                  placeholder="House number, colony, city"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Opening Khata Balance (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newCust.creditBalance || ''}
                  onChange={(e) => setNewCust({ ...newCust, creditBalance: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs"
            >
              Save Customer & Enable Khata
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
