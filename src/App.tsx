import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { InvoiceModal } from './components/InvoiceModal';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Suppliers } from './pages/Suppliers';
import { Expenses } from './pages/Expenses';
import { AIAssistant } from './pages/AIAssistant';
import { AIForecast } from './pages/AIForecast';
import { AuditLogs } from './pages/AuditLogs';
import { Subscription } from './pages/Subscription';
import { Admin } from './pages/Admin';
import { Order } from './types';

const AppContent: React.FC = () => {
  const { user, business, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'app' | 'landing'>('app');

  // Global F2 hotkey to open POS billing from anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading VyaparAI Business Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || viewMode === 'landing') {
    return <LandingPage onEnterApp={() => setViewMode('app')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenInvoice={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              onOrderCompleted={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {activeTab === 'inventory' && <Inventory />}

          {activeTab === 'orders' && (
            <Orders
              onOpenInvoice={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {activeTab === 'customers' && <Customers />}

          {activeTab === 'suppliers' && <Suppliers />}

          {activeTab === 'expenses' && <Expenses />}

          {activeTab === 'ai-assistant' && <AIAssistant />}

          {activeTab === 'ai-forecast' && <AIForecast />}

          {activeTab === 'audit-logs' && <AuditLogs />}

          {activeTab === 'subscription' && <Subscription />}

          {activeTab === 'admin' && <Admin />}
        </main>
      </div>

      {/* Reusable Tax / Thermal Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          business={business}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
