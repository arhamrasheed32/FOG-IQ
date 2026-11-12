import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Fuel, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Zap,
  RotateCw,
  ArrowLeftRight
} from 'lucide-react';
import { api } from '../services/api';
import { RouteResponse, RouteOption } from '../types';

export const RouteIntelligencePage: React.FC = () => {
  const [origin, setOrigin] = useState<string>('Chennai Central Railway Station');
  const [destination, setDestination] = useState<string>('Tidel Park (OMR)');
  const [departureTime, setDepartureTime] = useState<string>('NOW');
  const [loading, setLoading] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const landmarks = [
    'Chennai Central Railway Station',
    'Chennai International Airport',
    'Tidel Park (OMR)',
    'Kathipara Cloverleaf',
    'Koyambedu CMBT',
    'Madhya Kailash',
    'Sholinganallur Junction',
    'Marina Beach (Napier Bridge)'
  ];

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleCalculateRoute = async () => {
    setLoading(true);
    try {
      const res = await api.calculateRoute(origin, destination);
      setRouteResult(res);
      setSelectedRouteIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleCalculateRoute();
  }, []);

  return (
    <div className="space-y-6">
      {/* Origin / Destination Search Card */}
      <div className="bg-card rounded-3xl p-6 shadow-card border border-slate-200/90">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Origin Location (Chennai)
              </label>
            </div>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute()}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {/* Quick picks */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {landmarks.slice(0, 4).map((lm) => (
                <button
                  key={lm}
                  onClick={() => setOrigin(lm)}
                  className="text-[11px] bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 px-2.5 py-1 rounded-xl border border-slate-200/60 transition-colors cursor-pointer"
                >
                  {lm}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-600" /> Destination Location (Chennai)
              </label>
              <button
                onClick={handleSwap}
                title="Swap origin and destination"
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3" /> Swap
              </button>
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute()}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {/* Quick picks */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {landmarks.slice(2, 6).map((lm) => (
                <button
                  key={lm}
                  onClick={() => setDestination(lm)}
                  className="text-[11px] bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 px-2.5 py-1 rounded-xl border border-slate-200/60 transition-colors cursor-pointer"
                >
                  {lm}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200/90">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Routing Engine:</span>
            <span className="text-xs font-mono px-3 py-1 bg-brand-50 border border-brand-100 rounded-xl text-brand-600 font-bold">
              Google Routes API (TRAFFIC_AWARE)
            </span>
          </div>

          <button
            onClick={handleCalculateRoute}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs shadow-glowPurple transition-all"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            Calculate Live Routes
          </button>
        </div>
      </div>

      {/* Route Results & Comparison */}
      {routeResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-card px-5 py-2.5 rounded-2xl border border-slate-200/90 shadow-soft">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-brand-600" /> Data Source: <strong className="text-slate-800">{routeResult.data_source}</strong>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Computed: {new Date(routeResult.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {routeResult.routes.map((route, idx) => {
              const isSelected = selectedRouteIndex === idx;
              return (
                <div
                  key={route.route_id || idx}
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-card border-brand-500 shadow-glowPurple'
                      : 'bg-card border-slate-200/90 hover:border-slate-300 shadow-card'
                  }`}
                >
                  {route.is_recommended && (
                    <div className="absolute top-0 right-0 bg-brand-100 border-b border-l border-brand-200 px-3.5 py-1 rounded-bl-2xl text-[10px] font-extrabold text-brand-700 tracking-wider">
                      FASTEST ROUTE
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-3 h-3 rounded-full bg-brand-600" />
                    <h3 className="text-sm font-bold text-slate-800">{route.summary}</h3>
                  </div>

                  {/* Metrics Comparison */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">Traffic ETA</span>
                      <span className="text-2xl font-black font-sans text-slate-800">
                        {route.traffic_duration_min} <span className="text-xs font-normal text-slate-400">min</span>
                      </span>
                      <span className="text-[10px] text-coral font-bold block mt-1">
                        +{route.traffic_delay_min}m delay
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">Free-Flow ETA</span>
                      <span className="text-2xl font-black font-sans text-slate-600">
                        {route.baseline_duration_min} <span className="text-xs font-normal text-slate-400">min</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Static duration</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">Distance</span>
                      <span className="text-2xl font-black font-sans text-brand-600">
                        {route.distance_km} <span className="text-xs font-normal text-slate-400">km</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-1">
                        ~{route.fuel_consumption_est_l || '1.2'}L fuel
                      </span>
                    </div>
                  </div>

                  {/* Delay severity progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-500">Congestion Severity</span>
                      <span className={route.congestion_severity === 'HEAVY' ? 'text-coral' : 'text-amber-500'}>
                        {route.congestion_severity}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          route.congestion_severity === 'HEAVY' ? 'bg-coral' : 'bg-amber-400'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(25, (route.traffic_delay_min / route.traffic_duration_min) * 200))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
