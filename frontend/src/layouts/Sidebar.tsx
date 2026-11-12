import React from 'react';
import {
  LayoutDashboard,
  Map,
  Navigation,
  Activity,
  TrendingUp,
  Cpu,
  Network,
  FlaskConical,
  Database,
  Bell,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapsed,
  activeAlertsCount,
}) => {
  const navItems = [
    { id: 'command-center' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-map' as NavTab, label: 'Traffic Map', icon: Map },
    { id: 'routes' as NavTab, label: 'Route Intelligence', icon: Navigation },
    { id: 'corridors' as NavTab, label: 'Corridor Monitor', icon: Activity },
    { id: 'forecasting' as NavTab, label: 'ML Forecasting', icon: TrendingUp },
    { id: 'edge' as NavTab, label: 'Edge Nodes', icon: Cpu },
    { id: 'fog' as NavTab, label: 'Fog Network', icon: Network },
    { id: 'ml-lab' as NavTab, label: 'ML Laboratory', icon: FlaskConical },
    { id: 'big-data' as NavTab, label: 'Data Lake', icon: Database },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: Bell, badge: activeAlertsCount },
    { id: 'observability' as NavTab, label: 'System Health', icon: Sliders },
  ];

  return (
    <aside
      className={`h-screen bg-card border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 z-30 select-none shadow-soft flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-glowPurple flex-shrink-0">
              <Radio className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-lg text-slate-900">
                  FOG-IQ<span className="text-brand-600">.</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Urban Mobility
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="py-2 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-brand-600 bg-brand-50/60'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">
                    {item.badge}
                  </span>
                )}
                {/* Active indicator bar on the right matching reference image */}
                {isActive && !collapsed && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-brand-600 rounded-l-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Minimal Footer & Collapse Control */}
      <div className="p-4 border-t border-slate-200/80">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Chennai 13.08°N
              </span>
            </div>
            <button
              onClick={onToggleCollapsed}
              title="Collapse sidebar"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapsed}
            title="Expand sidebar"
            className="w-10 h-10 mx-auto rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
