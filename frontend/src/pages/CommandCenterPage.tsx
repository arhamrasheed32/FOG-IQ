import React from 'react';
import { 
  MoreHorizontal, 
  Calendar, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Radio, 
  TrendingUp, 
  Cpu, 
  Zap,
  Sparkles
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { SensorState, FogState, Corridor, Alert, NavTab } from '../types';

interface CommandCenterProps {
  sensors: SensorState[];
  fogZones: FogState[];
  corridors: Corridor[];
  alerts: Alert[];
  summary: {
    avg_speed_kmh: number;
    avg_congestion_index: number;
    active_anomalies: number;
    connected_sensors: number;
    total_sensors: number;
    ticks: number;
  };
  onNavigate: (tab: NavTab) => void;
  onSelectSensor: (sensor: SensorState) => void;
}

export const CommandCenterPage: React.FC<CommandCenterProps> = ({
  sensors,
  fogZones,
  corridors,
  alerts,
  summary,
  onNavigate,
  onSelectSensor,
}) => {
  const [flowRange, setFlowRange] = React.useState<'Week' | 'Month' | 'Today'>('Week');
  const [capacityRange, setCapacityRange] = React.useState<'Real-time' | 'Today' | 'Month'>('Real-time');
  const [diurnalRange, setDiurnalRange] = React.useState<'Today' | 'Yesterday' | '7-Day Average'>('Today');

  // Dynamic Flow Data based on selected range (Week / Today / Month)
  const flowDataByRange = {
    Week: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      freeFlow: [20, 18, 22, 16, 25, 20, 15],
      lightFlow: [35, 38, 30, 42, 30, 36, 40],
      moderateQueue: [25, 22, 28, 20, 26, 24, 25],
      severeBottleneck: [20, 22, 20, 22, 19, 20, 20]
    },
    Today: {
      categories: ['04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      freeFlow: [55, 15, 28, 18, 32, 50],
      lightFlow: [30, 25, 32, 28, 30, 25],
      moderateQueue: [10, 38, 26, 32, 24, 18],
      severeBottleneck: [5, 22, 14, 22, 14, 7]
    },
    Month: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      freeFlow: [22, 25, 19, 24],
      lightFlow: [38, 34, 40, 35],
      moderateQueue: [24, 22, 26, 23],
      severeBottleneck: [16, 19, 15, 18]
    }
  };

  const activeFlow = flowDataByRange[flowRange] || flowDataByRange.Week;

  // Chart 1: Statistics of Active Applications / Corridor Multi-Bar Chart
  const barChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
      shadowColor: 'rgba(0,0,0,0.06)',
      shadowBlur: 10,
    },
    grid: {
      top: 20,
      left: 30,
      right: 20,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: activeFlow.categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      interval: 20,
      axisLabel: { 
        formatter: '{value}%',
        color: '#94A3B8', 
        fontSize: 10 
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    series: [
      {
        name: 'Free Flow',
        type: 'bar',
        stack: 'total',
        barWidth: flowRange === 'Month' ? 14 : (flowRange === 'Today' ? 10 : 8),
        itemStyle: { color: '#6366F1' },
        data: activeFlow.freeFlow,
      },
      {
        name: 'Light Traffic',
        type: 'bar',
        stack: 'total',
        barWidth: flowRange === 'Month' ? 14 : (flowRange === 'Today' ? 10 : 8),
        itemStyle: { color: '#FBBF24' },
        data: activeFlow.lightFlow,
      },
      {
        name: 'Moderate Queue',
        type: 'bar',
        stack: 'total',
        barWidth: flowRange === 'Month' ? 14 : (flowRange === 'Today' ? 10 : 8),
        itemStyle: { color: '#FF6B4A' },
        data: activeFlow.moderateQueue,
      },
      {
        name: 'Severe Bottleneck',
        type: 'bar',
        stack: 'total',
        barWidth: flowRange === 'Month' ? 14 : (flowRange === 'Today' ? 10 : 8),
        itemStyle: { color: '#C7D2FE', borderRadius: [4, 4, 0, 0] },
        data: activeFlow.severeBottleneck,
      },
    ],
  };

  // Dynamic Arterial Capacity based on range
  const capacityDataByRange = {
    'Real-time': {
      annaSalai: 88,
      omr: 55,
      gst: 47,
      poonamallee: 35,
      innerRing: 24,
      networkStatus: 'Optimal Flow'
    },
    'Today': {
      annaSalai: 76,
      omr: 68,
      gst: 58,
      poonamallee: 44,
      innerRing: 32,
      networkStatus: 'Moderate Peak'
    },
    'Month': {
      annaSalai: 64,
      omr: 61,
      gst: 52,
      poonamallee: 39,
      innerRing: 28,
      networkStatus: 'Monthly Mean'
    }
  };

  const activeCapacity = capacityDataByRange[capacityRange] || capacityDataByRange['Real-time'];

  // Dynamic Diurnal Profile based on range
  const diurnalDataByRange = {
    'Today': {
      times: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
      values: [35, 62, 58, 88, 65, 82, 54],
      color: '#FF6B4A',
      rgba: 'rgba(255, 107, 74, 0.28)'
    },
    'Yesterday': {
      times: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
      values: [28, 54, 48, 74, 58, 92, 46],
      color: '#6366F1',
      rgba: 'rgba(99, 102, 241, 0.28)'
    },
    '7-Day Average': {
      times: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
      values: [32, 58, 52, 80, 61, 85, 50],
      color: '#10B981',
      rgba: 'rgba(16, 185, 129, 0.28)'
    }
  };

  const activeDiurnal = diurnalDataByRange[diurnalRange] || diurnalDataByRange.Today;

  // Chart 2: Diurnal Traffic Received Time Area Spline Curve
  const splineChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
    },
    grid: {
      top: 20,
      left: 30,
      right: 20,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: activeDiurnal.times,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      interval: 25,
      axisLabel: { formatter: '{value}%', color: '#94A3B8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: activeDiurnal.color, width: 2.5 },
        itemStyle: { color: activeDiurnal.color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: activeDiurnal.rgba },
              { offset: 1, color: 'rgba(255, 255, 255, 0.0)' },
            ],
          },
        },
        data: activeDiurnal.values,
      },
    ],
  };

  // Chart 3: Concentric Donut Gauge (matching bottom right in image)
  const donutChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [
      {
        name: 'Congestion Breakdown',
        type: 'pie',
        radius: ['60%', '80%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: 72, name: 'Normal / Free Flow', itemStyle: { color: '#6366F1' } },
          { value: 28, name: 'Bottleneck / Incident', itemStyle: { color: '#FF6B4A' } },
        ],
      },
      {
        name: 'Inner Ring',
        type: 'pie',
        radius: ['45%', '52%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: 85, name: 'Edge Connected', itemStyle: { color: '#FBBF24' } },
          { value: 15, name: 'Buffer Active', itemStyle: { color: '#E2E8F0' } },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* TOP ROW: 3 Modern Metric Cards with Circular Progress Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: City Congestion Level */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90 flex items-center justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                City Congestion Index
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
              {summary.avg_congestion_index}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-brand-600">
              <span className="flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14% vs Base
              </span>
            </div>
          </div>

          {/* Purple Circular Gauge */}
          <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#EEF2FF"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#6366F1"
                strokeWidth="5"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 * (1 - Math.min(1, summary.avg_congestion_index / 100))}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-brand-600">
              +{Math.round(summary.avg_congestion_index)}%
            </span>
          </div>

          <button 
            onClick={() => onNavigate('corridors')}
            title="Inspect Arterial Corridors"
            className="absolute top-5 right-5 text-slate-300 hover:text-brand-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Mean Corridor Velocity */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90 flex items-center justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                Corridor Mean Velocity
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
              {summary.avg_speed_kmh} <span className="text-sm font-normal text-slate-400">km/h</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-amber-500">
              <span className="flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +06% Speed
              </span>
            </div>
          </div>

          {/* Yellow/Amber Circular Gauge */}
          <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#FEF3C7"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#FBBF24"
                strokeWidth="5"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 * (1 - Math.min(1, summary.avg_speed_kmh / 70))}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-amber-600">
              +60%
            </span>
          </div>

          <button 
            onClick={() => onNavigate('routes')}
            title="Calculate Live Traffic Routes"
            className="absolute top-5 right-5 text-slate-300 hover:text-amber-500 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Active IoT Edge Sensors */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90 flex items-center justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                IoT Edge Nodes Active
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
              {summary.connected_sensors} <span className="text-sm font-normal text-slate-400">/ {summary.total_sensors}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-coral">
              <span className="flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> 0 Node Drops
              </span>
            </div>
          </div>

          {/* Coral / Orange Circular Gauge */}
          <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#FEE2E2"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#FF6B4A"
                strokeWidth="5"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 * 0.15}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-coral">
              +95%
            </span>
          </div>

          <button 
            onClick={() => onNavigate('edge')}
            title="Inspect 30 Edge Nodes"
            className="absolute top-5 right-5 text-slate-300 hover:text-coral p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MIDDLE ROW: Statistics of Active Applications (Bar Chart) & Acquisitions (Progress List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Statistics of Active Applications (Multi-Bar Chart) */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-card border border-slate-200/90">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Statistics of Active Mobility Flow
            </h3>
            <div className="relative">
              <select
                value={flowRange}
                onChange={(e) => setFlowRange(e.target.value as any)}
                className="appearance-none flex items-center gap-1.5 pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Week">Week</option>
                <option value="Today">Today</option>
                <option value="Month">Month</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-brand-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Chart Viewport */}
          <div className="w-full h-64">
            <ReactECharts option={barChartOption} notMerge={true} style={{ height: '100%', width: '100%' }} />
          </div>

          {/* Legend Pills at Bottom */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-200/90 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Free Flow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Light Flow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-coral" /> Moderate Queue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-200" /> Severe Bottleneck
            </span>
          </div>
        </div>

        {/* Right Column (1 Col): Acquisitions / Corridor Capacity */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Arterial Capacity Load
              </h3>
              <div className="relative">
                <select
                  value={capacityRange}
                  onChange={(e) => setCapacityRange(e.target.value as any)}
                  className="appearance-none flex items-center gap-1 pl-7 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Real-time">Real-time</option>
                  <option value="Today">Today</option>
                  <option value="Month">Month</option>
                </select>
                <Calendar className="w-3 h-3 text-brand-500 absolute left-2.5 top-2.5 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* List with Progress Bars - Clickable to navigate to corridors */}
            <div className="space-y-4 pt-1">
              {/* Item 1 */}
              <div 
                onClick={() => onNavigate('corridors')}
                title="Click to view Anna Salai Corridor telemetry"
                className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 group-hover:text-brand-600">
                    <span className="w-2 h-2 rounded-full bg-brand-600" /> Anna Salai Arterial
                  </span>
                  <span className="text-slate-800 font-mono">{activeCapacity.annaSalai}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${activeCapacity.annaSalai}%` }} />
                </div>
              </div>

              {/* Item 2 */}
              <div 
                onClick={() => onNavigate('corridors')}
                title="Click to view OMR Expressway telemetry"
                className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 group-hover:text-amber-500">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> OMR (IT Expressway)
                  </span>
                  <span className="text-slate-800 font-mono">{activeCapacity.omr}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${activeCapacity.omr}%` }} />
                </div>
              </div>

              {/* Item 3 */}
              <div 
                onClick={() => onNavigate('corridors')}
                title="Click to view GST Road telemetry"
                className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 group-hover:text-coral">
                    <span className="w-2 h-2 rounded-full bg-coral" /> GST Road Gateway
                  </span>
                  <span className="text-slate-800 font-mono">{activeCapacity.gst}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-coral rounded-full transition-all duration-500" style={{ width: `${activeCapacity.gst}%` }} />
                </div>
              </div>

              {/* Item 4 */}
              <div 
                onClick={() => onNavigate('corridors')}
                title="Click to view Poonamallee High Rd telemetry"
                className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 group-hover:text-brand-600">
                    <span className="w-2 h-2 rounded-full bg-brand-300" /> Poonamallee High Rd
                  </span>
                  <span className="text-slate-800 font-mono">{activeCapacity.poonamallee}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-300 rounded-full transition-all duration-500" style={{ width: `${activeCapacity.poonamallee}%` }} />
                </div>
              </div>

              {/* Item 5 */}
              <div 
                onClick={() => onNavigate('corridors')}
                title="Click to view Inner Ring Road telemetry"
                className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 group-hover:text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Inner Ring Road
                  </span>
                  <span className="text-slate-800 font-mono">{activeCapacity.innerRing}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${activeCapacity.innerRing}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-200/90 flex items-center justify-between text-[11px] text-slate-400">
            <span>Overall Network Load</span>
            <span className="font-bold text-brand-600 font-mono">{activeCapacity.networkStatus}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Applications Received Time (Spline) & Candidates by Gender (Concentric Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Diurnal Received Time (Spline Area Chart) */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-card border border-slate-200/90">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">
              Diurnal Flow & Ingestion Profile
            </h3>
            <div className="relative">
              <select
                value={diurnalRange}
                onChange={(e) => setDiurnalRange(e.target.value as any)}
                className="appearance-none flex items-center gap-1.5 pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="7-Day Average">7-Day Average</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-coral absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="w-full h-56">
            <ReactECharts option={splineChartOption} notMerge={true} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Right Column (1 Col): Concentric Donut Gauge matching reference image */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Congestion Distribution
            </h3>
            <div className="w-full h-48 flex items-center justify-center">
              <ReactECharts option={donutChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-200/90 text-xs font-medium text-slate-500">
            <button 
              onClick={() => onNavigate('live-map')}
              title="View normal free flow nodes on map"
              className="flex items-center gap-1.5 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Free Flow
            </button>
            <button 
              onClick={() => onNavigate('alerts')}
              title="View active bottleneck alerts"
              className="flex items-center gap-1.5 hover:text-coral transition-colors cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-coral" /> Bottleneck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
