import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const Subscription: React.FC = () => {
  const { business, refreshUserData } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'success'>('checkout');

  useEffect(() => {
    api.getPlans().then(setPlans);
  }, []);

  const handleStartUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setPaymentStep('checkout');
    setShowRazorpayModal(true);
  };

  const handleCompleteRazorpay = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    try {
      await api.upgradePlan(selectedPlan);
      await refreshUserData();
      setPaymentStep('success');
    } catch (err: any) {
      alert(err.message || 'Payment upgrade failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          Flexible SaaS Pricing for Indian MSMEs
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Choose the Perfect Growth Plan for {business?.name}
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Scale from single Kirana counter to multi-branch supermarket chain. Cancel or change plan anytime.
        </p>
      </div>

      {/* Current Active Plan Badge */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex items-center justify-between shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Current Active Subscription</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {business?.plan || 'Professional'} Plan
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            Active
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Renews 31 Dec 2026</p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = business?.plan === p.id;
          const isPopular = p.badge;

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                isPopular
                  ? 'bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl ring-2 ring-indigo-500'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                  {p.badge}
                </div>
              )}

              <div>
                <h3 className="font-black text-lg">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black">₹{p.price}</span>
                  <span className={`text-xs ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                    /{p.interval}
                  </span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs">
                  {p.features.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-emerald-400' : 'text-indigo-600'}`} />
                      <span className={isPopular ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartUpgrade(p.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                      isPopular
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700'
                    }`}
                  >
                    {p.price === 0 ? 'Downgrade to Free' : 'Upgrade with Razorpay'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Razorpay Checkout Modal Simulator */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Razorpay Top Header */}
            <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <span className="font-bold text-xs tracking-wide">Razorpay Secured Checkout</span>
              </div>
              <button onClick={() => setShowRazorpayModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentStep === 'checkout' ? (
              <div className="p-6 space-y-4">
                <div className="text-center pb-3 border-b">
                  <p className="text-xs text-slate-500">Upgrading {business?.name} to</p>
                  <p className="text-lg font-black text-slate-900">{selectedPlan} Plan</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">
                    ₹{plans.find(p => p.id === selectedPlan)?.price || 999}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-50/50 flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-800">UPI / QR Code (GPay, PhonePe, Paytm)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Fastest</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-700">Credit / Debit Card (Visa, Master, RuPay)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-700">Netbanking (HDFC, SBI, ICICI, Axis)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCompleteRazorpay}
                    disabled={isProcessing}
                    className="w-full py-3 bg-[#0c2340] hover:bg-blue-950 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isProcessing ? 'Verifying with Razorpay...' : 'Pay & Activate Plan'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    256-bit Encrypted • 100% Secure Gateway
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your business has been upgraded to the {selectedPlan} Plan. All advanced features are unlocked immediately.
                  </p>
                </div>
                <button
                  onClick={() => setShowRazorpayModal(false)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
