import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Store,
  Receipt,
  Boxes,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  Smartphone,
  Zap,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { login, register, demoLogin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Grocery / Kirana');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      setShowAuthModal(false);
      onEnterApp();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        phone,
        businessName,
        businessCategory,
        city
      });
      setShowAuthModal(false);
      onEnterApp();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setLoading(true);
    try {
      await demoLogin(demoEmail);
      setShowAuthModal(false);
      onEnterApp();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/80 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
            Vyapar<span className="text-indigo-400">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#ai-assistant" className="hover:text-white transition-colors">Gemini AI</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => handleQuickDemo('rajesh@sharmakirana.com')}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 md:px-12 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Built specifically for Indian Kirana, Pharmacy & Retail MSMEs 🇮🇳
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight md:leading-[1.15]">
          Manage your entire store with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Smart Intelligence
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          From fast barcode POS billing, automated GST invoices & digital Khata (उधार), to Google Gemini 3.8 Flash sales forecasting. Replace notebooks and outdated software today.
        </p>

        {/* Hero CTA & Instant Demo Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => handleQuickDemo('rajesh@sharmakirana.com')}
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Try Live Store (Sharma Kirana)</span>
          </button>

          <button
            onClick={() => handleQuickDemo('admin@vyaparai.com')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>Super Admin Portal</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Indian GST & Thermal POS Ready
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bilingual Gemini AI (Hindi + English)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Khata Reminders & Invoices
          </span>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-16 px-6 md:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Enterprise Tools Made Simple</span>
          <h2 className="text-2xl md:text-3xl font-black text-white">Everything Your Store Needs in One Screen</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* POS Feature */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">High-Speed POS & GST Billing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan barcodes, calculate CGST/SGST, accept UPI QR or Cash with change calculator, and print thermal 58mm receipts in 2 seconds.
            </p>
          </div>

          {/* AI Copilot Feature */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-900/50 space-y-3 hover:border-indigo-700 transition-colors relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <h3 className="font-bold text-base text-white">Gemini 3.8 Flash AI Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask in English or Hindi: "What were my sales today?", "Which stock is running out?", or "How can I increase shop margin?" Grounded in your live data.
            </p>
          </div>

          {/* Digital Khata */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Digital Khata (उधार बहीखाता)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track customer credit, send WhatsApp balance payment links with 1-click, and reward loyal buyers with store points.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-16 px-6 md:px-12 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Honest Indian Pricing</span>
          <h2 className="text-2xl md:text-3xl font-black text-white">Pocket-Friendly Plans for Every Dukandar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-base text-white">Free Starter</h4>
              <p className="text-2xl font-black text-white mt-2">₹0</p>
              <p className="text-xs text-slate-400 mt-1">Up to 50 Products & Thermal Print</p>
            </div>
            <button
              onClick={() => handleQuickDemo('rajesh@sharmakirana.com')}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800"
            >
              Start Free
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950 border border-indigo-600 flex flex-col justify-between relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-bold text-[10px] uppercase">
              Recommended
            </div>
            <div>
              <h4 className="font-bold text-base text-white">VyaparAI Pro</h4>
              <p className="text-2xl font-black text-white mt-2">₹999 <span className="text-xs font-normal text-indigo-300">/mo</span></p>
              <p className="text-xs text-indigo-200 mt-1">Unlimited Catalog + Gemini AI Copilot + 7-Day Forecasting</p>
            </div>
            <button
              onClick={() => handleQuickDemo('rajesh@sharmakirana.com')}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
            >
              Get Started with Pro
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-base text-white">Superstore Chain</h4>
              <p className="text-2xl font-black text-white mt-2">₹2,499 <span className="text-xs font-normal text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">Multi-Branch Sync, Custom Roles & Dedicated Account Rep</p>
            </div>
            <button
              onClick={() => handleQuickDemo('admin@vyaparai.com')}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 VyaparAI Technologies Pvt Ltd • Made with pride for Indian Retail & MSMEs 🇮🇳</p>
      </footer>

      {/* Auth Modal (Sign In / Sign Up) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-base">
                {authMode === 'login' ? 'Sign In to VyaparAI' : 'Create Business Account'}
              </span>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@sharmakirana.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="pt-2 text-center text-slate-400">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Register Store
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Business / Store Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Superstore"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Business Category *</label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                  >
                    <option value="Grocery / Kirana">Grocery / Kirana Store</option>
                    <option value="Medical Store / Pharmacy">Medical Store / Pharmacy</option>
                    <option value="Retail & Apparel">Retail & Apparel Store</option>
                    <option value="Wholesale & FMCG">Wholesale & FMCG Depot</option>
                    <option value="General Store">General Retail & Electronics</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98290 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sharma@store.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md mt-2"
                >
                  {loading ? 'Creating Account...' : 'Register Business Account'}
                </button>

                <div className="pt-2 text-center text-slate-400">
                  <span>Already registered? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Login Fillers */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Or One-Click Demo</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('rajesh@sharmakirana.com')}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 rounded-lg text-[10px] text-slate-300 font-medium"
                >
                  Sharma Kirana (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@vyaparai.com')}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 rounded-lg text-[10px] text-amber-300 font-medium"
                >
                  Super Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
