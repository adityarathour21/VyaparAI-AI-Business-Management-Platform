import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardMetrics, Order } from '../types';
import {
  TrendingUp,
  Receipt,
  Boxes,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  IndianRupee,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenInvoice: (order: Order) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenInvoice }) => {
  const { business } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setMetrics(data.metrics);
      setWeeklySales(data.weeklySales);
      setCategorySales(data.categorySales);
      setPaymentBreakdown(data.paymentBreakdown);
      setBestSellers(data.bestSellers);
      setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  if (loading && !metrics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading live business analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & AI Pulse Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            VyaparAI Real-time Business Intelligence
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
            {business?.name}
          </h1>
          <p className="text-indigo-200 text-xs md:text-sm mt-1 max-w-2xl">
            Today's revenue is <span className="font-bold text-white">₹{metrics?.todayRevenue.toLocaleString('en-IN')}</span> across {metrics?.todayOrdersCount} orders. You have {metrics?.lowStockCount} items below safety inventory threshold.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>Open POS Counter</span>
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Ask Store Advice</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Sales (Gross)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ₹{metrics?.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Today: ₹{metrics?.todayRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ₹{metrics?.netProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Gross: ₹{metrics?.grossProfit.toLocaleString('en-IN')} | Exp: ₹{metrics?.totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Low Stock Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics?.lowStockCount} <span className="text-xs font-medium text-slate-500">of {metrics?.totalProducts} SKUs</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold underline">
            Click to reorder products →
          </div>
        </div>

        {/* Customer Khata (Udhaar) Pending */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Customer Khata (Udhaar)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ₹{metrics?.pendingKhata.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Pending receivables to collect
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue & Profit Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Sales & Profit Performance</h3>
              <p className="text-xs text-slate-400">Daily store revenue and gross margin trends</p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-semibold">
              Live Data
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Method Distribution</h3>
            <p className="text-xs text-slate-400">Share of UPI, Cash, Cards & Khata</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  dataKey="amount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {paymentBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
            {paymentBreakdown.map((p, idx) => (
              <div key={p.method} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{p.method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Best Sellers & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Fast-Moving Products</h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View Inventory →
            </button>
          </div>

          <div className="space-y-3">
            {bestSellers.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.qty} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">₹{item.revenue.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">+₹{item.profit.toLocaleString('en-IN')} profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders / Invoices */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent POS Invoices</h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View All Bills →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => onOpenInvoice(order)}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {order.customerName} • {order.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    ₹{order.totalAmount}
                  </span>
                  <span className="text-[10px] text-indigo-600 hover:underline">Reprint Invoice</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
