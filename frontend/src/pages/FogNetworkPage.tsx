import React, { useState, useEffect } from 'react';
import { Network, Server, Zap, ShieldAlert, Activity, ArrowRight, Waves, Layers } from 'lucide-react';
import { api } from '../services/api';
import { FogState } from '../types';

export const FogNetworkPage: React.FC = () => {
  const [fogGateways, setFogGateways] = useState<FogState[]>([]);
  const [propagationEvents, setPropagationEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadFogData() {
      try {
        const [gw, ev] = await Promise.all([api.getFogGateways(), api.getPropagationEvents()]);
        setFogGateways(gw);
        setPropagationEvents(ev);
      } catch (e) {
        console.error(e);
      }
    }
    loadFogData();
    const interval = setInterval(loadFogData, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Propagation Event Alert Box if active */}
      {propagationEvents.length > 0 && (
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-5 h-5 text-red-600 animate-pulse" />
            <h3 className="text-sm font-bold text-red-700">
              Active Congestion Shockwave Propagation Detected
            </h3>
          </div>
          <div className="space-y-2">
            {propagationEvents.slice(0, 2).map((ev, i) => (
              <div key={i} className="text-xs text-slate-700 bg-white p-3 rounded-2xl border border-red-100 shadow-sm">
                <div className="font-bold text-red-600">{ev.message}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">
                  Corridor: {ev.corridor_id} | Zone: {ev.zone_id} | Shockwave: {ev.propagation_velocity_kmh} km/h (Backward Wave)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fog Gateways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {fogGateways.map((gw) => (
          <div
            key={gw.zone_id}
            className="p-6 bg-card border border-slate-200/90 rounded-3xl shadow-card relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 uppercase">
                  {gw.zone_id}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-2">{gw.name}</h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {gw.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono mb-5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90">
                <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Avg Speed</span>
                <span className="text-xl font-extrabold text-brand-600">{gw.avg_speed_kmh} km/h</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90">
                <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Total Flow</span>
                <span className="text-xl font-extrabold text-slate-800">{gw.total_flow_vph} vph</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90">
                <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Avg Congestion</span>
                <span className={`text-xl font-extrabold ${gw.avg_congestion_index >= 60 ? 'text-coral' : 'text-amber-500'}`}>
                  {gw.avg_congestion_index}
                </span>
              </div>
            </div>

            {/* Latency Pipeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs">
              <span className="text-[10px] text-slate-400 block mb-2 font-bold uppercase tracking-wider">Distributed Latency Pipeline</span>
              <div className="flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans font-semibold">Edge → Fog</span>
                  <span className="text-brand-600 font-extrabold">{gw.edge_to_fog_latency_ms} ms</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans font-semibold">Fog Regional Agg</span>
                  <span className="text-slate-800 font-extrabold">2.4 ms</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans font-semibold">Fog → Cloud</span>
                  <span className="text-brand-600 font-extrabold">{gw.fog_to_cloud_latency_ms} ms</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
