import { SensorState, FogState, Corridor, RouteResponse, Alert, MLPrediction, SystemHealth } from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Command Center
  getCommandCenterSummary: async () => {
    const res = await fetch(`${API_BASE}/command-center/summary`);
    return res.json();
  },

  // Traffic & Sensors
  getSensors: async (corridorId?: string): Promise<SensorState[]> => {
    const url = corridorId ? `${API_BASE}/traffic/sensors?corridor_id=${corridorId}` : `${API_BASE}/traffic/sensors`;
    const res = await fetch(url);
    return res.json();
  },

  getSensorDetail: async (sensorId: string) => {
    const res = await fetch(`${API_BASE}/traffic/sensors/${sensorId}`);
    return res.json();
  },

  getCorridors: async (): Promise<Corridor[]> => {
    const res = await fetch(`${API_BASE}/traffic/corridors`);
    return res.json();
  },

  getFogZones: async (): Promise<FogState[]> => {
    const res = await fetch(`${API_BASE}/traffic/fog-zones`);
    return res.json();
  },

  // Routes
  calculateRoute: async (origin: string, destination: string, departureTime?: string): Promise<RouteResponse> => {
    const res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, departure_time: departureTime })
    });
    return res.json();
  },

  // Forecasting
  getPredictions: async (corridorId?: string): Promise<MLPrediction[]> => {
    const url = corridorId ? `${API_BASE}/forecasting/predictions?corridor_id=${corridorId}` : `${API_BASE}/forecasting/predictions`;
    const res = await fetch(url);
    return res.json();
  },

  // Edge Devices
  getEdgeDevices: async () => {
    const res = await fetch(`${API_BASE}/edge/devices`);
    return res.json();
  },

  // Fog Gateways & Propagation
  getFogGateways: async () => {
    const res = await fetch(`${API_BASE}/fog/gateways`);
    return res.json();
  },

  getPropagationEvents: async () => {
    const res = await fetch(`${API_BASE}/fog/propagation-events`);
    return res.json();
  },

  // ML Lab
  getMLModels: async () => {
    const res = await fetch(`${API_BASE}/ml/models`);
    return res.json();
  },

  getMLMetrics: async () => {
    const res = await fetch(`${API_BASE}/ml/metrics`);
    return res.json();
  },

  getFeatureImportances: async () => {
    const res = await fetch(`${API_BASE}/ml/feature-importances`);
    return res.json();
  },

  // Big Data
  getDataLakeStats: async () => {
    const res = await fetch(`${API_BASE}/big-data/stats`);
    return res.json();
  },

  getHourlyAnalytics: async () => {
    const res = await fetch(`${API_BASE}/big-data/hourly`);
    return res.json();
  },

  getCorridorComparisons: async () => {
    const res = await fetch(`${API_BASE}/big-data/corridors`);
    return res.json();
  },

  // Alerts
  getAlerts: async (status?: string, severity?: string): Promise<Alert[]> => {
    let url = `${API_BASE}/alerts/`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    return res.json();
  },

  acknowledgeAlert: async (alertId: string) => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, { method: 'POST' });
    return res.json();
  },

  resolveAlert: async (alertId: string) => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, { method: 'POST' });
    return res.json();
  },

  // System Observability
  getSystemHealth: async (): Promise<SystemHealth> => {
    const res = await fetch(`${API_BASE}/system/health`);
    return res.json();
  },

  // Distributed Benchmarks
  getDistributedBenchmark: async () => {
    const res = await fetch(`${API_BASE}/distributed/benchmark`);
    return res.json();
  },

  // Simulator Controls
  controlSimulator: async (action: string, payload: Record<string, any> = {}) => {
    const res = await fetch(`${API_BASE}/traffic/simulator/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    return res.json();
  }
};

