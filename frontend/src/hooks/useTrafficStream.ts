import { useState, useEffect, useRef } from 'react';
import { SensorState, FogState, Alert } from '../types';

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
      avg_speed_kmh: 42.5,
      avg_congestion_index: 28.0,
      active_anomalies: 0,
      connected_sensors: 30,
      total_sensors: 30,
      ticks: 0,
    },
    sensors: [],
    fog_zones: [],
    propagation_events: [],
    alerts: [],
    isConnected: false,
    lastUpdated: new Date().toISOString(),
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let unmounted = false;

    function connect() {
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
                sensors: msg.sensors || [],
                fog_zones: msg.fog_zones || [],
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
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        if (!unmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  return data;
}

