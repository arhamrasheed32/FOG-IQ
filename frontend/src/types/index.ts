export interface SensorState {
  sensor_id: string;
  edge_id: string;
  corridor_id: string;
  zone_id: string;
  intersection_name: string;
  lat: number;
  lng: number;
  base_speed: number;
  current_speed: number;
  vehicle_count: number;
  density_vpm: number;
  queue_length_m: number;
  arrival_rate_vpm: number;
  congestion_index: number;
  operating_status: 'NORMAL' | 'MODERATE' | 'CONGESTED' | 'ANOMALY' | 'DISCONNECTED' | 'INCIDENT';
  is_connected: boolean;
  anomaly_score: number;
  is_anomaly: boolean;
  buffer_count: number;
  last_updated: string;
  data_source: string;
  is_simulated: boolean;
}

export interface FogState {
  zone_id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  connected_edges: number;
  avg_speed_kmh: number;
  total_flow_vph: number;
  avg_congestion_index: number;
  active_anomalies: number;
  edge_to_fog_latency_ms: number;
  fog_to_cloud_latency_ms: number;
  propagation_event?: {
    corridor_id: string;
    zone_id: string;
    congested_nodes: string[];
    severity: string;
    propagation_velocity_kmh: number;
    message: string;
    detected_at: string;
  } | null;
}

export interface Corridor {
  id: string;
  name: string;
  code: string;
  length_km: number;
  speed_limit_kmh: number;
  key_intersections: string[];
  zone_id: string;
  color: string;
  coordinates: [number, number][];
  current_speed_kmh?: number;
  congestion_index?: number;
  total_queue_m?: number;
  congested_bottlenecks?: number;
  status?: string;
}

export interface RouteOption {
  route_id: string;
  summary: string;
  is_recommended: boolean;
  distance_km: number;
  traffic_duration_min: number;
  baseline_duration_min: number;
  traffic_delay_min: number;
  congestion_severity: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE';
  corridors_traversed?: string[];
  fuel_consumption_est_l?: number;
  waypoints?: { lat: number; lng: number }[];
  polyline?: string;
}

export interface RouteResponse {
  origin: string;
  destination: string;
  data_source: string;
  provenance_note?: string;
  routes: RouteOption[];
  timestamp: string;
}

export interface Alert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  corridor_id: string;
  sensor_id: string;
  source: string;
  description: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
}

export interface MLPrediction {
  sensor_id: string;
  corridor_id: string;
  current_ci: number;
  current_speed: number;
  forecast_5m_ci: number;
  forecast_15m_ci: number;
  forecast_30m_ci: number;
  predicted_speed_15m: number;
  congestion_category: string;
  confidence_interval: [number, number];
  model_version: string;
  algorithm: string;
  data_source: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  components: {
    fastapi_backend: { status: string; uptime: string; health: string };
    websocket_hub: { status: string; endpoint: string; active_subscribers: number };
    google_maps_platform: { status: string; traffic_layer_support: boolean; routes_api_available: boolean };
    aws_adapter: {
      mode: string;
      aws_configured: boolean;
      s3_connected: boolean;
      dynamodb_connected: boolean;
      sns_connected: boolean;
      iot_core_connected: boolean;
    };
    virtual_iot_simulator: { status: string; total_sensors: number; frequency_sec: number; ticks_generated: number };
    fog_gateway_layer: { status: string; active_gateways: number; avg_edge_to_fog_latency_ms: number };
    telemetry_data_lake: { status: string; storage: string };
  };
}

export type NavTab = 
  | 'command-center'
  | 'live-map'
  | 'routes'
  | 'corridors'
  | 'forecasting'
  | 'edge'
  | 'fog'
  | 'ml-lab'
  | 'big-data'
  | 'alerts'
  | 'observability';

