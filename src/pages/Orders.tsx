import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import {
  ShoppingBag,
  Search,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Receipt
} from 'lucide-react';

interface OrdersProps {
  onOpenInvoice: (order: Order) => void;
}

export const Orders: React.FC<OrdersProps> = ({ onOpenInvoice }) => {
  const { business } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [business?.id]);

  const handleUpdateStatus = async (id: string, status: 'Completed' | 'Cancelled' | 'Refunded') => {
    if (window.confirm(`Are you sure you want to mark this invoice as ${status}? Eligible items will have their stock automatically restored.`)) {
      try {
        await api.updateOrderStatus(id, status);
        loadOrders();
      } catch (err: any) {
        alert(err.message || 'Status update failed');
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(search));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            Orders & Tax Invoices Register
          </h1>
          <p className="text-xs text-slate-500">
            Real-time record of all counter sales, reprints, GST breakdown & stock restoration
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Item Count</th>
                <th className="py-3 px-3">Payment Mode</th>
                <th className="py-3 px-3 text-right">Tax (GST)</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-800 dark:text-white">#{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800 dark:text-white">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400">{order.customerPhone || 'Walk-in'}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {order.items.length} items
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      ₹{order.taxAmount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenInvoice(order)}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View / Print</span>
                        </button>
                        {order.status === 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Refunded')}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded"
                            title="Refund & Restore Stock"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
