import React, { useState, useEffect } from 'react';
import { Database, HardDrive, FileSpreadsheet, BarChart2, Layers, ShieldCheck, Zap } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { api } from '../services/api';

export const BigDataAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [corridorsComp, setCorridorsComp] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [st, hr, cr] = await Promise.all([
          api.getDataLakeStats(),
          api.getHourlyAnalytics(),
          api.getCorridorComparisons(),
        ]);
        setStats(st);
        setHourlyData(hr);
        setCorridorsComp(cr);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const diurnalOption = {
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
      data: ['Throughput (vph)', 'Avg Speed (km/h)', 'Congestion Index'],
      textStyle: { color: '#64748B', fontWeight: 500 },
      top: 0,
    },
    grid: {
      top: 40,
      left: 50,
      right: 50,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map((h) => h.hour),
      axisLabel: { color: '#64748B', fontSize: 10 },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Volume (Vehicles / hr)',
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'Speed (km/h)',
        max: 80,
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Throughput (vph)',
        type: 'bar',
        data: hourlyData.map((h) => h.volume_vph),
        barWidth: 10,
        itemStyle: { color: '#6366F1', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Avg Speed (km/h)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: hourlyData.map((h) => h.avg_speed),
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 2.5 },
      },
      {
        name: 'Congestion Index',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: hourlyData.map((h) => h.congestion_index),
        itemStyle: { color: '#FF6B4A' },
        lineStyle: { type: 'dashed', width: 2 },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Storage & Throughput KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-card border border-slate-200/90 rounded-3xl shadow-card">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Total Ingested Records</span>
            <div className="text-3xl font-extrabold text-slate-800 font-sans">
              {stats.total_records.toLocaleString()}
            </div>
            <span className="text-[11px] text-brand-600 font-semibold mt-1 block">ZSTD / Snappy Compressed</span>
          </div>

          <div className="p-6 bg-card border border-slate-200/90 rounded-3xl shadow-card">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Storage Footprint</span>
            <div className="text-3xl font-extrabold text-brand-600 font-sans">
              {stats.total_storage_mb} MB
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">{stats.partition_count} Date Partitions</span>
          </div>

          <div className="p-6 bg-card border border-slate-200/90 rounded-3xl shadow-card">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Ingestion Rate</span>
            <div className="text-3xl font-extrabold text-emerald-600 font-sans">
              {stats.ingestion_throughput_records_sec} <span className="text-xs font-normal text-slate-400">rec/sec</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Continuous Stream</span>
          </div>

          <div className="p-6 bg-card border border-slate-200/90 rounded-3xl shadow-card">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Schema Conformance</span>
            <div className="text-3xl font-extrabold text-amber-500 font-sans">
              {stats.schema_conformance}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">0.00% missing values</span>
          </div>
        </div>
      )}

      {/* Diurnal Traffic Distribution */}
      <div className="bg-card border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <h3 className="text-xs font-bold text-slate-800 mb-2">
          24-Hour Diurnal Urban Traffic Volume & Velocity Distribution (Chennai Corridors)
        </h3>
        <div className="w-full h-72">
          <ReactECharts option={diurnalOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      {/* Corridor Comparison Table */}
      <div className="bg-card border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <h3 className="text-xs font-bold text-slate-800 mb-3">
          Cross-Corridor Capacity & Peak Congestion Summary
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/80 border-b border-slate-200/90">
              <tr>
                <th className="py-3 px-4">Corridor</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Average Speed</th>
                <th className="py-3 px-4">Peak Congestion Index</th>
                <th className="py-3 px-4">Estimated Daily Volume</th>
                <th className="py-3 px-4">Congestion Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {corridorsComp.map((c) => (
                <tr key={c.code} className="hover:bg-brand-50/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.corridor}</td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-600">{c.code}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.avg_speed} km/h</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-500">{c.peak_ci}</td>
                  <td className="py-3 px-4 text-slate-600">{c.daily_volume.toLocaleString()} veh/day</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                      c.status === 'SEVERE' ? 'bg-coral/10 text-coral' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {c.status}
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
