import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Building2,
  Users,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Search,
  Sparkles
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminOverview()
      .then(setAdminData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== 'Super Admin') {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Super Admin Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This panel is reserved for platform administrators. Use the role switcher in the top navigation bar to select "Super Admin".
        </p>
      </div>
    );
  }

  if (loading || !adminData) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading platform administrator metrics...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          VyaparAI Multi-Tenant Super Administrator Console
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Platform-Wide Governance & Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Monitor all onboarded Indian retail businesses, system tenants & platform GMV
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Platform GMV</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{adminData.totalPlatformGMV.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Across all retail tenants</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Registered Businesses</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {adminData.totalBusinesses}
          </p>
          <span className="text-[10px] text-slate-400">Kirana, Pharmacy & Apparel</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Active User Accounts</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {adminData.totalUsers}
          </p>
          <span className="text-[10px] text-slate-400">Owners, Managers, Cashiers</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Invoices Processed</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {adminData.totalOrders}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">99.98% System Uptime</span>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active Business Tenants</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">City & State</th>
                <th className="py-3 px-3">GSTIN</th>
                <th className="py-3 px-3">Plan Tier</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {adminData.businesses.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{b.name}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{b.category}</td>
                  <td className="py-3 px-3 text-slate-500">{b.city}, {b.state}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">{b.gstin || 'Unregistered'}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {b.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
