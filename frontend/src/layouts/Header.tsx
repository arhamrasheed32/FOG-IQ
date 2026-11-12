import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  AlertOctagon, 
  Cloud, 
  Radio, 
  Calendar, 
  Filter,
  Flame,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  currentTabName: string;
  isConnected: boolean;
  awsMode: string;
  ticks: number;
  onOpenFaultInjection: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabName,
  isConnected,
  awsMode,
  ticks,
  onOpenFaultInjection,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  const toggleSimulation = async () => {
    setLoadingAction(true);
    try {
      if (isPaused) {
        await api.controlSimulator('resume');
        setIsPaused(false);
      } else {
        await api.controlSimulator('pause');
        setIsPaused(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between select-none shadow-sm flex-shrink-0 z-10">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight capitalize">
          {currentTabName}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Real-time urban operations & distributed fog telemetry
        </p>
      </div>

      {/* Center / Right: Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar matching reference image */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search arterial, sensor node..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchSubmit?.(searchQuery);
              }
            }}
            className="w-64 pl-4 pr-11 py-2.5 bg-slate-100 border border-slate-200/90 rounded-2xl text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-soft transition-all"
          />
          <button
            onClick={() => onSearchSubmit?.(searchQuery)}
            title="Search arterial or sensor"
            className="absolute right-1.5 w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Simulator Toggle */}
        <button
          onClick={toggleSimulation}
          disabled={loadingAction}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold shadow-soft border transition-all ${
            isPaused
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-slate-100 text-slate-800 border-slate-200/90 hover:bg-slate-200/60'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-amber-500" /> : <Pause className="w-3.5 h-3.5 text-emerald-500" />}
          <span>{isPaused ? 'Resume Sim' : 'Live Sim'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </button>

        {/* Fault Injection Button */}
        <button
          onClick={onOpenFaultInjection}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-2xl text-xs shadow-md hover:from-red-600 hover:to-rose-700 transition-all"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Inject Fault</span>
        </button>
      </div>
    </header>
  );
};
