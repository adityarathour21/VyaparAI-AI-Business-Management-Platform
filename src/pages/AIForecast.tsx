import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ForecastData } from '../types';
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Package,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const AIForecast: React.FC = () => {
  const { business } = useAuth();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAIForecast();
      setForecast(data);
    } catch (err: any) {
      console.error('Failed to load forecast:', err);
      setError(err.message || 'Unable to load forecast data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [business?.id]);

  if (loading && !forecast) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Running Gemini AI predictive sales modeling...</p>
      </div>
    );
  }

  if (error && !forecast) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-1" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Forecast Service Temporarily Busy</h3>
        <p className="text-xs text-slate-500 max-w-sm text-center">{error}</p>
        <button
          onClick={loadForecast}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 mt-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry AI Forecast</span>
        </button>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            AI Demand & Sales Forecasting
          </h1>
          <p className="text-xs text-slate-500">
            Powered by Gemini 3.8 Flash • Mathematical projection based on verified retail velocity
          </p>
        </div>

        <button
          onClick={loadForecast}
          className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-calculate Model
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projected 7-Day Revenue */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span>Projected 7-Day Revenue</span>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="text-3xl font-black text-white">
            ₹{forecast.projectedRevenue7Days.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Estimated Growth: {forecast.growthRateEstimate} vs trailing week
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Model Confidence Level</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {forecast.confidenceScore}%
          </div>
          <p className="text-[11px] text-slate-400">
            High data reliability • Calibrated on actual past invoice flow
          </p>
        </div>

        {/* Restock Urgency */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Critical Restock Recommendations</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {forecast.restockRecommendations.length} <span className="text-xs font-normal text-slate-500">Items</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Preventing impending retail stockouts
          </p>
        </div>
      </div>

      {/* AI Executive Commentary */}
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-2xl text-xs md:text-sm text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">Gemini Market Pulse & Forecast Analysis</p>
          <p className="mt-1 leading-relaxed">{forecast.summary}</p>
        </div>
      </div>

      {/* Chart: 7-Day Day-by-Day Forecast */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Projected Day-by-Day Demand Curve</h3>
            <p className="text-xs text-slate-400">Estimated sales revenue (₹) for each upcoming day</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">7-Day Horizon</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast.dailyForecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  name === 'predictedSales' ? `₹${Number(value).toLocaleString('en-IN')}` : value,
                  name === 'predictedSales' ? 'Projected Sales' : 'Estimated Orders'
                ]}
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="predictedSales" name="Projected Sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations & Seasonal Patterns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Restocks */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />
            AI Replenishment Recommendations
          </h3>

          <div className="space-y-2.5">
            {forecast.restockRecommendations.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white">{item.productName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Order +{item.recommendedQuantity} units
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Trends & Behavioral Insights */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Retail Dynamics & Seasonal Observations
          </h3>

          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {forecast.seasonalTrends.map((trend, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
