import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Zap, ShieldCheck, AlertTriangle, ArrowRight, BarChart2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { api } from '../services/api';
import { MLPrediction, Corridor, SensorState } from '../types';

interface TrafficForecastingPageProps {
  corridors: Corridor[];
  sensors: SensorState[];
}

export const TrafficForecastingPage: React.FC<TrafficForecastingPageProps> = ({
  corridors,
  sensors,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ANNA_SALAI');
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPredictions() {
      setLoading(true);
      try {
        const res = await api.getPredictions(selectedCorridor);
        setPredictions(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions();
  }, [selectedCorridor]);

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
      data: ['Current CI', '+5m Horizon', '+15m Horizon', '+30m Horizon'],
      textStyle: { color: '#64748B', fontWeight: 500 },
      top: 0,
    },
    grid: {
      top: 40,
      left: 40,
      right: 30,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: predictions.map((p) => p.sensor_id),
      axisLabel: { color: '#64748B', fontSize: 11, fontWeight: 500 },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
    },
    yAxis: {
      type: 'value',
      name: 'Congestion Index (0-100)',
      max: 100,
      nameTextStyle: { color: '#64748B' },
      axisLabel: { color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    series: [
      {
        name: 'Current CI',
        type: 'bar',
        data: predictions.map((p) => p.current_ci),
        barWidth: 12,
        itemStyle: { color: '#6366F1', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '+5m Horizon',
        type: 'line',
        data: predictions.map((p) => p.forecast_5m_ci),
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 2.5 },
      },
      {
        name: '+15m Horizon',
        type: 'line',
        data: predictions.map((p) => p.forecast_15m_ci),
        itemStyle: { color: '#FBBF24' },
        lineStyle: { width: 2.5 },
      },
      {
        name: '+30m Horizon',
        type: 'line',
        data: predictions.map((p) => p.forecast_30m_ci),
        itemStyle: { color: '#FF6B4A' },
        lineStyle: { type: 'dashed', width: 2.5 },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Corridor Selector */}
      <div className="flex items-center gap-3 bg-card border border-slate-200/90 p-4 rounded-3xl shadow-card">
        <span className="text-xs text-slate-500 font-bold">Select Arterial Corridor:</span>
        <select
          value={selectedCorridor}
          onChange={(e) => setSelectedCorridor(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          {corridors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.id})
            </option>
          ))}
        </select>
        <span className="text-xs font-mono font-bold text-brand-600 ml-auto flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-100">
          <Zap className="w-3.5 h-3.5 text-brand-600" /> Model: XGBoost Regressor (v1.4.0-chennai)
        </span>
      </div>

      {/* Multi-Step Horizon Chart */}
      <div className="bg-card border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <h3 className="text-xs font-bold text-slate-800 mb-2">
          Congestion Trajectory Across Forecasting Horizons (+5m, +15m, +30m)
        </h3>
        <div className="w-full h-72">
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      {/* Predictions Table with Confidence Intervals */}
      <div className="bg-card border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <h3 className="text-xs font-bold text-slate-800 mb-4">
          Detailed Node Predictions & Uncertainty Bounds
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/80 border-b border-slate-200/90">
              <tr>
                <th className="py-3 px-4">Node</th>
                <th className="py-3 px-4">Current CI</th>
                <th className="py-3 px-4">Current Speed</th>
                <th className="py-3 px-4">+5m Forecast</th>
                <th className="py-3 px-4">+15m Forecast</th>
                <th className="py-3 px-4">+30m Forecast</th>
                <th className="py-3 px-4">Predicted Speed (+15m)</th>
                <th className="py-3 px-4">95% Confidence Interval</th>
                <th className="py-3 px-4">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono font-medium">
              {predictions.map((p) => (
                <tr key={p.sensor_id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-brand-600">{p.sensor_id}</td>
                  <td className="py-3 px-4 text-slate-800 font-bold">{p.current_ci}</td>
                  <td className="py-3 px-4 text-slate-700">{p.current_speed} km/h</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{p.forecast_5m_ci}</td>
                  <td className="py-3 px-4 text-amber-500 font-bold">{p.forecast_15m_ci}</td>
                  <td className="py-3 px-4 text-coral font-bold">{p.forecast_30m_ci}</td>
                  <td className="py-3 px-4 text-slate-900 font-bold">{p.predicted_speed_15m} km/h</td>
                  <td className="py-3 px-4 text-slate-500">
                    [{p.confidence_interval[0]}, {p.confidence_interval[1]}]
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-sans font-bold bg-slate-100 text-slate-700">
                      {p.congestion_category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
