import React, { useState } from 'react';
import { Activity, Clock, AlertTriangle, ShieldCheck, TrendingDown, Layers, MapPin } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { Corridor, SensorState } from '../types';

interface CorridorMonitoringPageProps {
  corridors: Corridor[];
  sensors: SensorState[];
  onSelectSensor: (sensor: SensorState) => void;
}

export const CorridorMonitoringPage: React.FC<CorridorMonitoringPageProps> = ({
  corridors,
  sensors,
  onSelectSensor,
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('ANNA_SALAI');

  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  const corridorSensors = sensors.filter((s) => s.corridor_id === selectedCorridor?.id);

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
      shadowColor: 'rgba(0,0,0,0.06)',
      shadowBlur: 10,
    },
    legend: {
      data: ['Current Velocity (km/h)', 'Speed Limit (km/h)', 'Congestion Index (0-100)'],
      textStyle: { color: '#64748B', fontWeight: 500 },
      top: 0,
    },
    grid: {
      top: 40,
      left: 50,
      right: 50,
      bottom: 50,
    },
    xAxis: {
      type: 'category',
      data: corridorSensors.map((s) => s.intersection_name.split(' - ')[1] || s.sensor_id),
      axisLabel: {
        color: '#64748B',
        fontSize: 11,
        interval: 0,
        rotate: 15,
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Speed (km/h)',
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'Congestion Index',
        max: 100,
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Current Velocity (km/h)',
        type: 'bar',
        data: corridorSensors.map((s) => s.current_speed),
        barWidth: 16,
        itemStyle: {
          color: (params: any) => (params.value < 25 ? '#FF6B4A' : (params.value < 40 ? '#FBBF24' : '#10B981')),
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: 'Speed Limit (km/h)',
        type: 'line',
        data: corridorSensors.map(() => selectedCorridor.speed_limit_kmh),
        lineStyle: { type: 'dashed', color: '#6366F1', width: 2 },
        itemStyle: { color: '#6366F1' },
      },
      {
        name: 'Congestion Index (0-100)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: corridorSensors.map((s) => s.congestion_index),
        lineStyle: { color: '#FF6B4A', width: 2.5 },
        itemStyle: { color: '#FF6B4A' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Corridor Selector Pills */}
      <div className="flex flex-wrap gap-2.5">
        {corridors.map((c) => {
          const isSelected = c.id === selectedCorridor?.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCorridorId(c.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-glowPurple'
                  : 'bg-card text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-soft hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Corridor Overview Card */}
      {selectedCorridor && (
        <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200/90 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-100">
                  {selectedCorridor.code}
                </span>
                <h3 className="text-base font-extrabold text-slate-800">{selectedCorridor.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Length: {selectedCorridor.length_km} km | Design Speed: {selectedCorridor.speed_limit_kmh} km/h | Zone: {selectedCorridor.zone_id}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">Nodes</span>
                <span className="text-base font-extrabold text-slate-800">{corridorSensors.length}</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">Velocity</span>
                <span className="text-base font-extrabold text-brand-600">
                  {corridorSensors.length
                    ? (corridorSensors.reduce((acc, s) => acc + s.current_speed, 0) / corridorSensors.length).toFixed(1)
                    : 0}{' '}
                  km/h
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">Bottlenecks</span>
                <span className="text-base font-extrabold text-coral">
                  {corridorSensors.filter((s) => s.congestion_index >= 60).length}
                </span>
              </div>
            </div>
          </div>

          {/* Speed & Congestion Profile Chart */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              Cross-Intersection Velocity & Congestion Profile
            </h4>
            <div className="w-full h-72">
              <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Intersections Table */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-700 mb-3">
              Sensor Intersection Readings
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/80 border-b border-slate-200/90">
                  <tr>
                    <th className="py-3 px-4">Sensor ID</th>
                    <th className="py-3 px-4">Intersection</th>
                    <th className="py-3 px-4">Speed</th>
                    <th className="py-3 px-4">Congestion Index</th>
                    <th className="py-3 px-4">Queue Length</th>
                    <th className="py-3 px-4">Density</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {corridorSensors.map((s) => (
                    <tr
                      key={s.sensor_id}
                      onClick={() => onSelectSensor(s)}
                      className="hover:bg-brand-50/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-brand-600">{s.sensor_id}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{s.intersection_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.current_speed} km/h</td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={s.congestion_index >= 60 ? 'text-coral' : 'text-amber-500'}>
                          {s.congestion_index}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.queue_length_m} m</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.density_vpm} vpm</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          s.operating_status === 'DISCONNECTED'
                            ? 'bg-slate-100 text-slate-500'
                            : s.is_anomaly
                            ? 'bg-red-50 text-red-600'
                            : s.congestion_index >= 60
                            ? 'bg-coral/10 text-coral'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {s.operating_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
