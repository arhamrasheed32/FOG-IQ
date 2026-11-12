import React, { useState } from 'react';
import { X, AlertTriangle, WifiOff, Wifi, Flame, RotateCcw, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Corridor, SensorState } from '../types';

interface FaultInjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridors: Corridor[];
  sensors: SensorState[];
}

export const FaultInjectionModal: React.FC<FaultInjectionModalProps> = ({
  isOpen,
  onClose,
  corridors,
  sensors,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ANNA_SALAI');
  const [selectedSensor, setSelectedSensor] = useState<string>('S03');
  const [incidentType, setIncidentType] = useState<string>('VEHICLE_ACCIDENT');
  const [incidentDesc, setIncidentDesc] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInjectCongestion = async () => {
    try {
      const res = await api.controlSimulator('inject_congestion', {
        target: selectedCorridor,
        severity: 'CRITICAL',
      });
      setFeedback(`Severe congestion injected on ${selectedCorridor}! Affected ${res.affected_sensors?.length || 0} nodes.`);
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    }
  };

  const handleSimulateIncident = async () => {
    try {
      const res = await api.controlSimulator('simulate_incident', {
        sensor_id: selectedSensor,
        incident_type: incidentType,
        description: incidentDesc,
      });
      setFeedback(`Incident ${incidentType} registered at ${selectedSensor}!`);
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.controlSimulator('disconnect', { sensor_id: selectedSensor });
      setFeedback(`Sensor ${selectedSensor} disconnected. Offline edge buffer active.`);
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    }
  };

  const handleRestore = async () => {
    try {
      await api.controlSimulator('restore', { sensor_id: selectedSensor });
      setFeedback(`Sensor ${selectedSensor} restored. Flushing offline buffer to Fog Gateway.`);
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await api.controlSimulator('clear_all');
      setFeedback(`Cleared ${res.cleared_count || 0} incidents. Network returned to normal diurnal state.`);
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-coral/10 border border-coral/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-coral" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Interactive Fault & Incident Injector</h2>
            <p className="text-xs text-slate-400 font-medium">Directly perturb the physical simulator and observe fog/edge reaction</p>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-700 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Action 1: Corridor Congestion Shock */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-2">
              1. Inject Corridor Bottleneck Shock
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCorridor}
                onChange={(e) => setSelectedCorridor(e.target.value)}
                className="flex-1 bg-card border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleInjectCongestion}
                className="px-4 py-2 bg-coral hover:bg-coral-dark text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Inject Shock
              </button>
            </div>
          </div>

          {/* Action 2: Node Incident */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-2">
              2. Inject Intersection Incident
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <select
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(e.target.value)}
                className="bg-card border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {sensors.map((s) => (
                  <option key={s.sensor_id} value={s.sensor_id}>
                    {s.sensor_id} - {s.intersection_name}
                  </option>
                ))}
              </select>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="bg-card border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="VEHICLE_ACCIDENT">Vehicle Collision</option>
                <option value="LANE_CLOSURE">Construction / Lane Block</option>
                <option value="FLASH_FLOOD_RAIN">Monsoon Waterlogging</option>
                <option value="SIGNAL_MALFUNCTION">Signal Malfunction</option>
              </select>
            </div>
            <button
              onClick={handleSimulateIncident}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              Simulate Incident
            </button>
          </div>

          {/* Action 3: Disconnect / Restore Connectivity */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-2">
              3. Device Offline Buffer & Reconnection
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                className="flex-1 py-2 bg-card hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <WifiOff className="w-3.5 h-3.5 text-coral" /> Disconnect Node
              </button>
              <button
                onClick={handleRestore}
                className="flex-1 py-2 bg-card hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Reconnect & Flush
              </button>
            </div>
          </div>
        </div>

        {/* Clear All */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All Active Faults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-glowPurple transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

