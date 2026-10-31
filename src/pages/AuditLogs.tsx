import React, { useState, useEffect } from 'react';
import { api, getStoredToken, getStoredBusinessId } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AuditLog, AuditSeverity, AuditEntityType } from '../types';
import {
  ShieldAlert,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  ShoppingBag,
  Boxes,
  Users,
  Wallet,
  Clock,
  Eye,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { business } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        entityType: entityFilter !== 'all' ? entityFilter : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [business?.id, severityFilter, entityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const handleExportCSV = () => {
    const token = getStoredToken();
    const bizId = getStoredBusinessId() || business?.id || '';
    const url = `/api/audit-logs/export`;
    
    // Trigger download
    fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'x-business-id': bizId
      }
    })
      .then(res => res.text())
      .then(csv => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_logs_${business?.name || 'store'}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => alert('Failed to export audit logs: ' + err.message));
  };

  // Metrics
  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const warningCount = logs.filter(l => l.severity === 'warning').length;
  const inventoryCount = logs.filter(l => l.entityType === 'inventory' || l.entityType === 'product').length;

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            <Info className="w-3 h-3 text-indigo-500" />
            INFO
          </span>
        );
    }
  };

  const getEntityIcon = (entity: AuditEntityType) => {
    switch (entity) {
      case 'product':
      case 'inventory':
        return <Boxes className="w-3.5 h-3.5 text-indigo-500" />;
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />;
      case 'customer':
        return <Users className="w-3.5 h-3.5 text-purple-500" />;
      case 'expense':
        return <Wallet className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Security & Accountability Audit Trail (सुरक्षा एवं ऑडिट लॉग्स)
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Store Activity & Critical Event Logs
          </h1>
          <p className="text-xs text-slate-500">
            Immutable tracking for product deletions, manual stock overrides, cashier refunds & financial changes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Audited Events</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{logs.length}</p>
          <span className="text-[10px] text-slate-400">Recorded with actor & IP</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical Actions (Deletions & Refunds)
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</p>
          <span className="text-[10px] text-slate-400">High-risk changes flagged</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning Events (Overrides)
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">{warningCount}</p>
          <span className="text-[10px] text-slate-400">Price & inventory adjustments</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5" />
            Catalog & Stock Operations
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{inventoryCount}</p>
          <span className="text-[10px] text-slate-400">Products & stock movements</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Severity Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl text-xs w-full sm:w-auto">
            {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-colors ${
                  severityFilter === sev
                    ? sev === 'critical'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : sev === 'warning'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev === 'all' ? 'All Severities' : sev}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by action, user, product, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            />
          </form>
        </div>

        {/* Entity Type Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Entity:
          </span>
          {[
            { id: 'all', label: 'All Entities' },
            { id: 'product', label: 'Products' },
            { id: 'inventory', label: 'Inventory / Stock' },
            { id: 'order', label: 'Orders & POS' },
            { id: 'customer', label: 'Customer / Khata' },
            { id: 'expense', label: 'Expenses' }
          ].map(e => (
            <button
              key={e.id}
              onClick={() => setEntityFilter(e.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                entityFilter === e.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Register Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Timestamp & IP</th>
                <th className="py-3 px-3">Actor / Staff</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Action Event</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-4">Action Details & Impact</th>
                <th className="py-3 px-3 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                    Fetching verified audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit records matching criteria
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800 dark:text-white leading-tight">{log.userName}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        {log.userRole || 'Staff'}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3">{getSeverityBadge(log.severity)}</td>

                    {/* Action */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-white text-[11px]">
                      {log.action}
                    </td>

                    {/* Entity */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium capitalize">
                        {getEntityIcon(log.entityType)}
                        <span>{log.entityType}</span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-200 leading-snug">
                      <p className="max-w-md line-clamp-2">{log.details}</p>
                      {log.ipAddress && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Origin: {log.ipAddress}
                        </span>
                      )}
                    </td>

                    {/* Inspect Diff Button */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {(log.oldValue || log.newValue) ? (
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Diff</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No state diff</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Diff Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-xl w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                    {inspectingLog.action}
                  </span>
                  {getSeverityBadge(inspectingLog.severity)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Actor: <span className="font-semibold">{inspectingLog.userName}</span> ({inspectingLog.userRole}) • {new Date(inspectingLog.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Operation Description:</span>
              {inspectingLog.details}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Previous State */}
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Previous State (Before Action)
                </span>
                <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto min-h-[100px]">
                  {inspectingLog.oldValue ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(inspectingLog.oldValue, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-400 italic font-sans">No prior state (Initial creation)</span>
                  )}
                </div>
              </div>

              {/* New State */}
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  New State (After Action)
                </span>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto min-h-[100px]">
                  {inspectingLog.newValue ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(inspectingLog.newValue, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-400 italic font-sans">Entity Deleted / Purged</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectingLog(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-xs hover:bg-slate-800"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
