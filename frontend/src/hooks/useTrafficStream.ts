import { useState, useEffect, useRef } from 'react';
import { SensorState, FogState, Alert } from '../types';
import { DEFAULT_SENSORS, DEFAULT_FOG_ZONES } from '../services/mockData';

export interface TelemetryStreamData {
  summary: {
    avg_speed_kmh: number;
    avg_congestion_index: number;
    active_anomalies: number;
    connected_sensors: number;
    total_sensors: number;
    ticks: number;
  };
  sensors: SensorState[];
  fog_zones: FogState[];
  propagation_events: any[];
  alerts: Alert[];
  isConnected: boolean;
  lastUpdated: string;
}

export function useTrafficStream() {
  const [data, setData] = useState<TelemetryStreamData>({
    summary: {
      avg_speed_kmh: 44.5,
      avg_congestion_index: 22.8,
      active_anomalies: 0,
      connected_sensors: 30,
      total_sensors: 30,
      ticks: 1,
    },
    sensors: DEFAULT_SENSORS,
    fog_zones: DEFAULT_FOG_ZONES,
    propagation_events: [],
    alerts: [
      {
        id: 'alt-sim-01',
        severity: 'INFO',
        corridor_id: 'OMR',
        sensor_id: 'S08',
        source: 'Edge Micro-Inference',
        description: 'OMR corridor operating under steady evening flow. Signal greenwave active.',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }
    ],
    isConnected: false,
    lastUpdated: new Date().toISOString(),
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const simulationIntervalRef = useRef<any>(null);

  useEffect(() => {
    let unmounted = false;

    // Simulation tick when WebSocket is offline (e.g., AWS S3 static hosting)
    simulationIntervalRef.current = setInterval(() => {
      setData((prev) => {
        // If live WS is connected, let WS handle updates
        if (prev.isConnected) return prev;

        const jitter = (Math.random() - 0.48) * 1.5;
        const newAvgSpeed = Math.max(30, Math.min(55, Number((prev.summary.avg_speed_kmh + jitter).toFixed(1))));
        const newCi = Math.max(15, Math.min(45, Number((prev.summary.avg_congestion_index - jitter * 0.6).toFixed(1))));

        const updatedSensors = prev.sensors.map((s) => {
          const delta = (Math.random() - 0.5) * 2;
          const updatedSpeed = Math.max(20, Math.min(s.base_speed + 5, Number((s.current_speed + delta).toFixed(1))));
          const ratio = updatedSpeed / s.base_speed;
          const ci = Math.max(10, Math.min(80, Math.round((1 - ratio) * 100)));
          return {
            ...s,
            current_speed: updatedSpeed,
            congestion_index: ci,
            vehicle_count: Math.max(15, Math.min(80, Math.round(s.vehicle_count + (Math.random() - 0.5) * 4))),
            last_updated: new Date().toISOString()
          };
        });

        return {
          ...prev,
          summary: {
            ...prev.summary,
            avg_speed_kmh: newAvgSpeed,
            avg_congestion_index: newCi,
            ticks: prev.summary.ticks + 1,
          },
          sensors: updatedSensors,
          lastUpdated: new Date().toISOString(),
        };
      });
    }, 3000);

    function connect() {
      // If we are not on localhost or 127.0.0.1, do not spam websocket errors against static S3 endpoint
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (!isLocal) {
        return; // Run in resilient standalone mode
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/traffic`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!unmounted) {
            setData((prev) => ({ ...prev, isConnected: true }));
          }
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'TELEMETRY_UPDATE') {
              setData({
                summary: msg.summary,
                sensors: msg.sensors || DEFAULT_SENSORS,
                fog_zones: msg.fog_zones || DEFAULT_FOG_ZONES,
                propagation_events: msg.propagation_events || [],
                alerts: msg.alerts || [],
                isConnected: true,
                lastUpdated: msg.timestamp || new Date().toISOString(),
              });
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message', e);
          }
        };

        ws.onclose = () => {
          if (!unmounted) {
            setData((prev) => ({ ...prev, isConnected: false }));
            reconnectTimeoutRef.current = setTimeout(connect, 4000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        if (!unmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 4000);
        }
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  return data;
}
