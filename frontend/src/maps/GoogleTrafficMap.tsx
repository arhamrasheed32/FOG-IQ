import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Layers, MapPin, Eye, EyeOff, Radio, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';
import { SensorState, Corridor } from '../types';

interface GoogleTrafficMapProps {
  sensors: SensorState[];
  corridors: Corridor[];
  selectedSensor: SensorState | null;
  onSelectSensor: (sensor: SensorState) => void;
  highlightedCorridorId?: string | null;
}

export const GoogleTrafficMap: React.FC<GoogleTrafficMapProps> = ({
  sensors,
  corridors,
  selectedSensor,
  onSelectSensor,
  highlightedCorridorId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // Check for client-side API key
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('fog_iq_google_maps_key') || apiKey);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;
    const activeKey = customKey || apiKey;

    if (!activeKey || activeKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setLoadError('NO_API_KEY');
      return;
    }

    const loader = new Loader({
      apiKey: activeKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'routes'],
    });

    loader
      .load()
      .then((google) => {
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 13.0827, lng: 80.2707 }, // Chennai
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#F8FAFC' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#FFFFFF' }],
            },
            {
              featureType: 'road.arterial',
              elementType: 'geometry',
              stylers: [{ color: '#E2E8F0' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#CBD5E1' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#DBEAFE' }],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#F1F5F9' }],
            },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        });

        // Initialize Google TrafficLayer
        const tLayer = new google.maps.TrafficLayer();
        tLayer.setMap(map);

        setGoogleMap(map);
        setTrafficLayer(tLayer);
        setMapLoaded(true);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn('Google Maps load failed:', err);
        setLoadError(err.message || 'Failed to load Google Maps script');
      });
  }, [customKey]);

  // Handle TrafficLayer Toggle
  useEffect(() => {
    if (!trafficLayer || !googleMap) return;
    if (showTrafficLayer) {
      trafficLayer.setMap(googleMap);
    } else {
      trafficLayer.setMap(null);
    }
  }, [showTrafficLayer, trafficLayer, googleMap]);

  // Update Markers when sensors update
  useEffect(() => {
    if (!googleMap || !window.google) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!showSensors) return;

    sensors.forEach((s) => {
      let pinColor = '#25C58A'; // Success / normal
      if (s.operating_status === 'DISCONNECTED') pinColor = '#64748B';
      else if (s.is_anomaly || s.operating_status === 'INCIDENT') pinColor = '#F06464';
      else if (s.congestion_index >= 60) pinColor = '#F06464';
      else if (s.congestion_index >= 35) pinColor = '#F5B942';

      const marker = new window.google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map: googleMap,
        title: `${s.intersection_name} (${s.current_speed} km/h)`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: s.sensor_id === selectedSensor?.sensor_id ? 10 : 7,
          fillColor: pinColor,
          fillOpacity: 0.95,
          strokeColor: '#FFFFFF',
          strokeWeight: s.sensor_id === selectedSensor?.sensor_id ? 3 : 1.5,
        },
      });

      marker.addListener('click', () => {
        onSelectSensor(s);
      });

      markersRef.current.push(marker);
    });
  }, [googleMap, sensors, selectedSensor, showSensors]);

  // Update Corridor Polylines
  useEffect(() => {
    if (!googleMap || !window.google) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!showCorridors) return;

    corridors.forEach((c) => {
      const isHighlighted = highlightedCorridorId === c.id;
      const path = c.coordinates.map((coord) => ({ lat: coord[0], lng: coord[1] }));

      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: c.color,
        strokeOpacity: isHighlighted ? 1.0 : 0.7,
        strokeWeight: isHighlighted ? 6 : 3.5,
        map: googleMap,
      });

      polylinesRef.current.push(polyline);
    });
  }, [googleMap, corridors, highlightedCorridorId, showCorridors]);

  // Fallback Interactive Canvas GIS Viewer if Google Maps API key is not configured
  const renderFallbackGis = () => {
    // Chennai bounding box
    const minLat = 12.88, maxLat = 13.14;
    const minLng = 80.11, maxLng = 80.30;

    const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
    const toY = (lat: number) => 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    return (
      <div className="relative w-full h-full bg-[#080D18] overflow-hidden rounded-xl border border-white/10 select-none">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(rgba(85, 185, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Coastline indication for Bay of Bengal (East of Chennai) */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-cyan-950/20 border-l border-cyan-500/20 flex items-center justify-center">
          <span className="text-[10px] tracking-widest text-cyan-400/40 uppercase rotate-90 font-mono">
            Bay of Bengal
          </span>
        </div>

        {/* SVG Corridors and Fog Zones */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Corridors */}
          {showCorridors && corridors.map((c) => {
            const points = c.coordinates.map(coord => `${toX(coord[1])},${toY(coord[0])}`).join(' ');
            const isH = highlightedCorridorId === c.id;
            return (
              <polyline
                key={c.id}
                points={points}
                fill="none"
                stroke={c.color}
                strokeWidth={isH ? "1.6" : "0.9"}
                strokeOpacity={isH ? 0.95 : 0.65}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isH ? "none" : undefined}
              />
            );
          })}
        </svg>

        {/* Virtual Sensors Nodes */}
        {showSensors && sensors.map((s) => {
          const x = toX(s.lng);
          const y = toY(s.lat);
          const isSelected = selectedSensor?.sensor_id === s.sensor_id;

          let statusBg = 'bg-[#25C58A] shadow-glowSuccess';
          if (s.operating_status === 'DISCONNECTED') statusBg = 'bg-slate-500';
          else if (s.is_anomaly || s.operating_status === 'INCIDENT') statusBg = 'bg-[#F06464] shadow-glowCritical animate-pulse';
          else if (s.congestion_index >= 60) statusBg = 'bg-[#F06464]';
          else if (s.congestion_index >= 35) statusBg = 'bg-[#F5B942]';

          return (
            <div
              key={s.sensor_id}
              onClick={() => onSelectSensor(s)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 group`}
            >
              <div className={`relative flex items-center justify-center`}>
                <span className={`w-3.5 h-3.5 rounded-full ${statusBg} ${isSelected ? 'ring-4 ring-cyan-accent scale-125' : 'group-hover:scale-125'}`} />
                {s.is_anomaly && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-ping" />
                )}
              </div>
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute left-4 -top-3 z-30 bg-[#0F172A]/95 text-xs text-white px-2 py-1 rounded shadow-lg border border-white/10 whitespace-nowrap backdrop-blur-md">
                <span className="font-semibold text-primary">{s.intersection_name}</span>
                <div className="text-[10px] text-slate-300">
                  Speed: <span className="text-white font-mono">{s.current_speed} km/h</span> | CI: <span className="text-amber-300 font-mono">{s.congestion_index}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Provenance Banner */}
        <div className="absolute top-4 left-4 z-20 bg-surface-card/90 border border-white/10 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-slate-300 font-medium">Chennai Smart City GIS Viewport</span>
          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-mono">
            {sensors.length} Live IoT Sensors
          </span>
        </div>

        {/* API Key configuration prompt in bottom-left */}
        <div className="absolute bottom-4 left-4 z-20 bg-surface/90 border border-white/10 backdrop-blur-md p-3 rounded-lg text-xs max-w-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" /> Google Maps TrafficLayer
            </span>
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-[11px] text-primary hover:underline font-mono"
            >
              Set Google Key
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Interactive GIS engine is currently rendering real Chennai coordinates. Configure your Google Maps browser key to enable official Google TrafficLayer satellite overlays.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-card/95 border border-slate-200/80 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-card text-xs">
        <button
          onClick={() => setShowTrafficLayer(!showTrafficLayer)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            showTrafficLayer ? 'bg-brand-50 text-brand-600 border border-brand-200/80' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Toggle official Google TrafficLayer"
        >
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          Traffic Layer
        </button>

        <button
          onClick={() => setShowSensors(!showSensors)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            showSensors ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Toggle 30 virtual IoT sensor nodes"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Sensors ({sensors.length})
        </button>

        <button
          onClick={() => setShowCorridors(!showCorridors)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            showCorridors ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/80' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Toggle arterial corridor overlays"
        >
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          Corridors ({corridors.length})
        </button>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 w-full h-full relative">
        {loadError ? (
          renderFallbackGis()
        ) : (
          <div ref={mapRef} className="w-full h-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-card" />
        )}
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-white/15 rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Configure Google Maps Platform
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter your Google Maps JavaScript API Key (with Maps & Routes API enabled) to render Google's official TrafficLayer.
            </p>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 mb-4 focus:outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customKey) localStorage.setItem('fog_iq_google_maps_key', customKey);
                  setShowKeyModal(false);
                  setLoadError(null);
                }}
                className="px-4 py-1.5 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 shadow-glowPurple transition-colors"
              >
                Apply Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

