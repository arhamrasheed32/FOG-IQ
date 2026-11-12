import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle, Clock, AlertTriangle, Filter, Check } from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';

export const AlertCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const s = statusFilter !== 'ALL' ? statusFilter : undefined;
      const sv = severityFilter !== 'ALL' ? severityFilter : undefined;
      const res = await api.getAlerts(s, sv);
      setAlerts(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, [statusFilter, severityFilter]);

  const handleAcknowledge = async (id: string) => {
    // Immediate optimistic state update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    setNotification(`Alert ${id} acknowledged by operator`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await api.acknowledgeAlert(id);
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const handleResolve = async (id: string) => {
    // Immediate optimistic state update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
    setNotification(`Alert ${id} marked as resolved`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await api.resolveAlert(id);
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl animate-fade-in border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-5 bg-card border border-slate-200/90 rounded-3xl shadow-card">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        <div className="ml-auto text-xs font-mono font-bold text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-xl border border-brand-100">
          {filteredAlerts.length} Incident{filteredAlerts.length !== 1 ? 's' : ''} Tracked
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-card border border-slate-200/90 rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/80 border-b border-slate-200/90">
              <tr>
                <th className="py-3.5 px-5">Alert ID</th>
                <th className="py-3.5 px-5">Severity</th>
                <th className="py-3.5 px-5">Corridor / Node</th>
                <th className="py-3.5 px-5">Source</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    No incident alerts registered for current filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-brand-600">{a.id}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        a.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : a.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-brand-50 text-brand-600 border border-brand-100'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-800 font-semibold">
                      {a.corridor_id} <span className="text-slate-400 font-mono text-[10px]">({a.sensor_id})</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-[10px] font-mono">{a.source}</td>
                    <td className="py-3.5 px-5 text-slate-700 max-w-xs">{a.description}</td>
                    <td className="py-3.5 px-5 text-slate-400 text-[10px] font-mono">
                      {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        a.status === 'ACTIVE'
                          ? 'bg-red-100 text-red-700'
                          : a.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAcknowledge(a.id)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm mr-2 cursor-pointer"
                        >
                          Ack
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(a.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                      {a.status === 'RESOLVED' && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
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
