import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem, UserRole } from '../types';
import {
  Store,
  ChevronDown,
  Bell,
  Sparkles,
  PlusCircle,
  Receipt,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeTab }) => {
  const { user, business, businesses, switchBusiness, temporaryChangeRole, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBizMenu, setShowBizMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [business?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const roles: UserRole[] = ['Business Owner', 'Manager', 'Cashier', 'Inventory Staff', 'Super Admin'];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Brand & Active Business */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowBizMenu(!showBizMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              <Store className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {business?.name || 'My Store'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {business?.city || 'India'} • <span className="text-emerald-600 dark:text-emerald-400 font-medium">{business?.plan} Plan</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Business Dropdown */}
          {showBizMenu && (
            <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Your Registered Stores
              </div>
              {businesses.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    switchBusiness(b.id);
                    setShowBizMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                    b.id === business?.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p>{b.name}</p>
                    <p className="text-[10px] text-slate-400">{b.category} • {b.city}</p>
                  </div>
                  {b.id === business?.id && <span className="text-xs text-indigo-600">✓ Active</span>}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowBizMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left p-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Register Another Branch / Store
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-slate-400 text-[11px] px-1 font-medium">Role:</span>
          <select
            value={user?.role}
            onChange={(e) => temporaryChangeRole(e.target.value as UserRole)}
            className="bg-transparent font-medium text-slate-700 dark:text-slate-200 text-xs outline-none cursor-pointer"
          >
            {roles.map(r => (
              <option key={r} value={r} className="text-slate-900 bg-white dark:bg-slate-800">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions, AI, Notifs, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick New POS Bill Button */}
        <button
          onClick={() => onNavigate('pos')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
            activeTab === 'pos'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>New Bill (POS)</span>
          <span className="hidden md:inline-block px-1 py-0.2 bg-emerald-800/40 rounded text-[10px]">F2</span>
        </button>

        {/* VyaparAI Assistant Quick Button */}
        <button
          onClick={() => onNavigate('ai-assistant')}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="hidden sm:inline">Ask</span> VyaparAI
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 relative text-slate-600 dark:text-slate-300"
            title="Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  Store Alerts & Activity
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {unreadCount} unread
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recent alerts</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-2.5 text-xs rounded-lg transition-colors cursor-pointer ${
                        !n.read
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === 'low_stock' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {n.type === 'expiry' && <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                        {n.type === 'payment' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                        {n.type === 'subscription' && <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-semibold text-xs">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
                <div className="mt-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold inline-block">
                  {user?.role}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('subscription');
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Subscription & Invoices
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('admin');
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Super Admin Panel
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
