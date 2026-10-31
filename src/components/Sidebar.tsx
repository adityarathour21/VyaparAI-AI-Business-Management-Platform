import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  ShoppingBag,
  Users,
  Truck,
  Wallet,
  Sparkles,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const { user, business } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billing', icon: Receipt, hotkey: 'F2' },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'orders', label: 'Orders & Invoices', icon: ShoppingBag },
    { id: 'customers', label: 'Customers & Khata', icon: Users },
    { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck },
    { id: 'expenses', label: 'Expenses & P&L', icon: Wallet },
    { id: 'ai-assistant', label: 'VyaparAI Assistant', icon: Sparkles, highlight: true },
    { id: 'ai-forecast', label: 'Sales Forecasting', icon: TrendingUp },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldCheck },
    { id: 'subscription', label: 'Plans & Billing', icon: CreditCard },
  ];

  if (user?.role === 'Super Admin') {
    navItems.push({ id: 'admin', label: 'Super Admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            Vyapar<span className="text-indigo-400">AI</span>
          </span>
          <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Smart MSME Platform
          </span>
        </div>
      </div>

      {/* Store Quick Status */}
      <div className="mx-4 my-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span className="truncate">{business?.name || 'My Store'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Store Online" />
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
          GSTIN: {business?.gstin || 'Unregistered / Composition'}
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1 tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : item.highlight
                  ? 'text-indigo-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.hotkey && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                  {item.hotkey}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom SaaS Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
          <span>{business?.plan || 'Starter'} Tier</span>
          <button
            onClick={() => onNavigate('subscription')}
            className="text-indigo-400 hover:text-indigo-300 underline font-semibold text-[10px]"
          >
            Upgrade
          </button>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-indigo-500 h-full w-3/4 rounded-full" />
        </div>
        <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Made for Indian Retail 🇮🇳</span>
          <span className="font-mono">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
