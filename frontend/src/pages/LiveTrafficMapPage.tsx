import React, { useState } from 'react';
import { 
  MapPin, 
  Activity, 
  Cpu, 
  TrendingUp, 
  Layers, 
  X, 
  AlertTriangle, 
  Info,
  ShieldCheck,
  Zap,
  BarChart2
} from 'lucide-react';
import { GoogleTrafficMap } from '../maps/GoogleTrafficMap';
import { SensorState, Corridor } from '../types';

interface LiveTrafficMapPageProps {
  sensors: SensorState[];
  corridors: Corridor[];
  selectedSensor: SensorState | null;
  onSelectSensor: (sensor: SensorState | null) => void;
}

export const LiveTrafficMapPage: React.FC<LiveTrafficMapPageProps> = ({
  sensors,
  corridors,
  selectedSensor,
  onSelectSensor,
}) => {
  const [activeCorridorFilter, setActiveCorridorFilter] = useState<string>('ALL');

  const filteredSensors = activeCorridorFilter === 'ALL'
    ? sensors
    : sensors.filter((s) => s.corridor_id === activeCorridorFilter);

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] flex flex-col overflow-hidden rounded-3xl border border-slate-200 shadow-card">
      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-card/95 border border-slate-200/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-soft text-xs">
        <span className="text-slate-500 font-bold mr-1">Corridor Filter:</span>
        <select
          value={activeCorridorFilter}
          onChange={(e) => setActiveCorridorFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="ALL">All Chennai Corridors ({sensors.length} nodes)</option>
          {corridors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Map Viewport */}
      <div className="flex-1 w-full h-full relative">
        <GoogleTrafficMap
          sensors={filteredSensors}
          corridors={corridors}
          selectedSensor={selectedSensor}
          onSelectSensor={onSelectSensor}
          highlightedCorridorId={activeCorridorFilter !== 'ALL' ? activeCorridorFilter : null}
        />
      </div>

      {/* Sensor Detail Drawer (Overlaid on Right) */}
      {selectedSensor && (
        <div className="absolute right-4 top-16 bottom-4 w-84 bg-card/95 border border-slate-200/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl z-30 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-slate-200/90">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 uppercase">
                  {selectedSensor.sensor_id} • {selectedSensor.corridor_id}
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 mt-2">
                  {selectedSensor.intersection_name}
                </h3>
              </div>
              <button
                onClick={() => onSelectSensor(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Pill */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
              <span className="text-slate-500 font-medium">Node Status:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-xl text-[10px] ${
                  selectedSensor.operating_status === 'DISCONNECTED'
                    ? 'bg-slate-200 text-slate-700'
                    : selectedSensor.is_anomaly
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : selectedSensor.congestion_index >= 60
                    ? 'bg-coral/10 text-coral'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {selectedSensor.operating_status}
              </span>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Velocity</span>
                <span className="text-xl font-extrabold font-sans text-brand-600">
                  {selectedSensor.current_speed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Base: {selectedSensor.base_speed} km/h</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Congestion Index</span>
                <span className={`text-xl font-extrabold font-sans ${
                  selectedSensor.congestion_index >= 60 ? 'text-coral' : 'text-amber-500'
                }`}>
                  {selectedSensor.congestion_index} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Queue Length</span>
                <span className="text-sm font-extrabold font-mono text-slate-800">
                  {selectedSensor.queue_length_m} m
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Density</span>
                <span className="text-sm font-extrabold font-mono text-slate-800">
                  {selectedSensor.density_vpm} vpm
                </span>
              </div>
            </div>

            {/* Edge Intelligence Details */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-brand-600" /> Edge Micro-Inference
                </span>
                <span className="text-slate-700 font-mono font-semibold">{selectedSensor.edge_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Local Anomaly Score</span>
                <span className={`font-mono font-bold ${selectedSensor.anomaly_score >= 0.6 ? 'text-coral' : 'text-emerald-600'}`}>
                  {selectedSensor.anomaly_score}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Offline Buffer Queue</span>
                <span className="font-mono text-slate-700 font-bold">{selectedSensor.buffer_count} packets</span>
              </div>
            </div>

            {/* Geospatial Coordinates */}
            <div className="mt-3 text-[10px] text-slate-400 font-mono flex justify-between px-1">
              <span>LAT: {selectedSensor.lat.toFixed(4)}°N</span>
              <span>LNG: {selectedSensor.lng.toFixed(4)}°E</span>
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="pt-4 border-t border-slate-200/90 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-brand-600">
              <Zap className="w-3 h-3 text-brand-600" /> {selectedSensor.data_source}
            </span>
            <span className="font-mono text-slate-400">Simulated: YES</span>
          </div>
        </div>
      )}
    </div>
  );
};
