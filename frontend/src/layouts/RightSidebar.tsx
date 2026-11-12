import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Bell, 
  RotateCw, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Check,
  Building2,
  Sun,
  Compass,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { Alert, NavTab } from '../types';

interface RightSidebarProps {
  sensorsCount: number;
  awsMode: string;
  alerts: Alert[];
  onOpenFaultInjection: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  sensorsCount,
  awsMode,
  alerts,
  onOpenFaultInjection,
  onNavigate,
}) => {
  const [sensorsActive, setSensorsActive] = useState<boolean>(true);
  const [awsActive, setAwsActive] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSensors = async () => {
    try {
      if (sensorsActive) {
        await api.controlSimulator('pause');
        setSensorsActive(false);
        showToast('Virtual IoT Telemetry stream paused');
      } else {
        await api.controlSimulator('resume');
        setSensorsActive(true);
        showToast('Virtual IoT Telemetry streaming active');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAws = () => {
    if (awsActive) {
      setAwsActive(false);
      showToast('Offline Edge Buffer Mode: telemetry buffered locally');
    } else {
      setAwsActive(true);
      showToast('AWS Cloud Mode: Live DynamoDB & S3 writes active (us-east-1)');
    }
  };

  return (
    <aside className="w-80 h-screen bg-card border-l border-slate-200/90 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar select-none shadow-soft relative flex-shrink-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-4 right-4 z-40 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium text-[11px] leading-tight">{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Operations Hub Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                Chennai TMC Console
              </h3>
              <p className="text-[10px] text-slate-400 font-mono font-medium">
                Terminal #04 • Zone Central
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </span>
        </div>

        {/* Environmental & City Road Context Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-brand-50/20 border border-slate-100 mb-6 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Chennai Metropolis
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              Optimal Flow
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase tracking-wider">Weather</span>
              <span className="text-slate-800 font-bold">31°C • Dry</span>
            </div>
            <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase tracking-wider">TMC Window</span>
              <span className="text-brand-600 font-bold">Peak Rush</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span className="flex items-center gap-1 font-mono">
              <Compass className="w-3 h-3 text-brand-600" /> 13.08° N, 80.27° E
            </span>
            <span className="font-bold text-slate-700">6 Corridors Active</span>
          </div>
        </div>

        {/* System Controls / Vibrant Gradient Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide">Live Dispatch Controls</h4>
            <button
              onClick={onOpenFaultInjection}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-full transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Event
            </button>
          </div>

          <div className="space-y-3">
            {/* Card 1: Vibrant Orange Coral Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF8E53] text-white shadow-glowOrange relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-extrabold font-mono">
                  {sensorsCount}
                </div>
                <div>
                  <h5 className="text-xs font-bold">Virtual IoT Sensors</h5>
                  <p className="text-[10px] text-white/80">30 Nodes Continuous Stream</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleSensors}
                title={sensorsActive ? 'Pause IoT sensor streaming' : 'Resume IoT sensor streaming'}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  sensorsActive ? 'bg-white' : 'bg-white/40'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    sensorsActive
                      ? 'translate-x-5 bg-[#FF6B4A]'
                      : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>

            {/* Card 2: Vibrant Purple / Violet Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-glowPurple relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-black font-mono">
                  AWS
                </div>
                <div>
                  <h5 className="text-xs font-bold">Cloud Telemetry Lake</h5>
                  <p className="text-[10px] text-white/80">DynamoDB & S3 Active</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleAws}
                title={awsActive ? 'Switch to offline buffer mode' : 'Switch to live AWS writes mode'}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  awsActive ? 'bg-white' : 'bg-white/40'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    awsActive
                      ? 'translate-x-5 bg-[#6366F1]'
                      : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders / Live Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide">Live Operational Feed</h4>
            <Bell className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {/* Event 1 */}
            <button
              onClick={() => onNavigate?.('fog')}
              className="w-full text-left flex items-start gap-3 p-2.5 rounded-2xl hover:bg-brand-50/50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <RotateCw className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 truncate">Fog aggregation sync</h6>
                  <span className="text-[10px] font-mono text-slate-400">Live</span>
                </div>
                <p className="text-[11px] text-brand-600 font-semibold">5 regional gateways online →</p>
              </div>
            </button>

            {/* Event 2 */}
            <button
              onClick={() => onNavigate?.('corridors')}
              className="w-full text-left flex items-start gap-3 p-2.5 rounded-2xl hover:bg-amber-50/50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 truncate">OMR IT Expressway</h6>
                  <span className="text-[10px] font-mono text-slate-400">Monitor</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Tidel Park signal queue 240m →</p>
              </div>
            </button>

            {/* Event 3 */}
            <button
              onClick={() => onNavigate?.('alerts')}
              className="w-full text-left flex items-start gap-3 p-2.5 rounded-2xl hover:bg-red-50/50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 truncate">Shockwave Warning</h6>
                  <span className="text-[10px] font-mono text-coral font-bold">Active</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Backward propagating bottleneck →</p>
              </div>
            </button>

            {/* Event 4 */}
            <button
              onClick={() => onNavigate?.('ml-lab')}
              className="w-full text-left flex items-start gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 truncate">XGBoost Horizon v1.4.0</h6>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">R² 0.91</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Latency & feature importance →</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-serif">FOG-IQ v1.4.0</span>
        <span className="font-mono text-emerald-600 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> AWS us-east-1
        </span>
      </div>
    </aside>
  );
};

