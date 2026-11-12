import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff, Clock, ShieldCheck, AlertTriangle, Layers, RefreshCw, Terminal } from 'lucide-react';
import { api } from '../services/api';

export const EdgeIntelligencePage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);

  const fetchDevices = async () => {
    try {
      const res = await api.getEdgeDevices();
      setDevices(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleConnect = async (dev: any) => {
    try {
      if (dev.is_connected) {
        await api.controlSimulator('disconnect', { sensor_id: dev.sensor_id });
      } else {
        await api.controlSimulator('restore', { sensor_id: dev.sensor_id });
      }
      fetchDevices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-600" /> Edge Intelligence & Micro-Inference Nodes
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            30 distributed edge computing runtime nodes executing local anomaly inference with offline ring buffering
          </p>
        </div>

        <button
          onClick={() => setShowRecipeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-brand-600 shadow-soft transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-brand-600" /> Greengrass V2 Recipe
        </button>
      </div>

      {/* Grid of 30 Edge Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {devices.map((dev) => (
          <div
            key={dev.edge_id}
            className={`p-5 rounded-3xl border transition-all ${
              !dev.is_connected
                ? 'bg-slate-50/80 border-slate-200 opacity-75'
                : dev.is_anomaly
                ? 'bg-red-50/30 border-red-200 shadow-glowOrange'
                : 'bg-card border-slate-200/90 shadow-card'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                  {dev.edge_id} • {dev.sensor_id}
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">
                  {dev.intersection_name}
                </h4>
              </div>

              <button
                onClick={() => handleToggleConnect(dev)}
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  dev.is_connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-red-50 hover:text-red-600'
                    : 'bg-red-50 border-red-200 text-red-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
                title={dev.is_connected ? 'Click to Disconnect Node' : 'Click to Reconnect Node'}
              >
                {dev.is_connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Edge Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono mb-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Latency</span>
                <span className="text-base font-extrabold text-brand-600">{dev.processing_latency_ms} ms</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Buffer</span>
                <span className={`text-base font-extrabold ${dev.buffered_messages > 0 ? 'text-coral' : 'text-slate-800'}`}>
                  {dev.buffered_messages} pkts
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-200/90">
              <span className="text-slate-400 font-medium">Local Anomaly Score</span>
              <span className={`font-mono font-extrabold ${dev.local_anomaly_score >= 0.6 ? 'text-coral' : 'text-emerald-600'}`}>
                {dev.local_anomaly_score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Greengrass Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-600" /> AWS IoT Greengrass V2 Component Recipe
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Recipe definition for `com.fogiq.traffic.edge.processor` deployable to Greengrass Core nodes
            </p>
            <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
{`{
  "RecipeFormatVersion": "2020-05-31",
  "ComponentName": "com.fogiq.traffic.edge.processor",
  "ComponentVersion": "1.0.0",
  "ComponentDescription": "FOG-IQ Urban Traffic Edge Computing Component for real-time sensor processing and local anomaly inference",
  "ComponentPublisher": "FOG-IQ Systems",
  "ComponentConfiguration": {
    "DefaultConfiguration": {
      "ZoneId": "fog-gw-central",
      "SensorId": "S01",
      "SamplingIntervalSec": 2,
      "AnomalyThreshold": 0.65,
      "CloudMqttTopic": "fogiq/chennai/edge/telemetry",
      "LocalBufferMax": 1000
    }
  },
  "Manifests": [
    {
      "Platform": { "os": "linux" },
      "Lifecycle": {
        "Install": "python3 -m pip install --user paho-mqtt numpy scikit-learn",
        "Run": "python3 -u {artifacts:path}/edge_processor.py --zone {configuration:/ZoneId} --sensor {configuration:/SensorId}"
      }
    }
  ]
}`}
            </pre>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowRecipeModal(false)}
                className="px-5 py-2 bg-brand-600 text-white font-bold rounded-2xl text-xs hover:bg-brand-700 shadow-glowPurple"
              >
                Close Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
