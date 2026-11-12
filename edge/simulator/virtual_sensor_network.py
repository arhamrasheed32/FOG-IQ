"""
FOG-IQ Virtual IoT Sensor Network & Edge Simulation Engine
Simulates 30 edge-connected virtual traffic sensors across 7 Chennai corridors
and 5 regional fog gateways.
Supports real-time telemetry generation, edge anomaly detection, buffer queuing,
fault injection (congestion shock, accidents, disconnection, sensor drift).
"""

import time
import math
import random
import threading
from datetime import datetime
from typing import Dict, List, Optional, Any
import numpy as np

from backend.app.core.chennai_network import VIRTUAL_SENSORS, CORRIDORS, FOG_ZONES

class VirtualSensorNetwork:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(VirtualSensorNetwork, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.running = True
        self.paused = False
        self.interval = 1.8  # seconds between ticks
        self.tick_count = 0

        # Sensor state store: sensor_id -> dict
        self.sensor_states: Dict[str, Dict[str, Any]] = {}
        # Active faults & incidents: sensor_id -> dict
        self.active_incidents: Dict[str, Dict[str, Any]] = {}
        # Disconnected sensors: set of sensor_id
        self.disconnected_sensors = set()

        # Edge device buffers (for offline queuing): edge_id -> list
        self.edge_buffers: Dict[str, List[Dict[str, Any]]] = {}

        # Fog gateway aggregated states: zone_id -> dict
        self.fog_states: Dict[str, Dict[str, Any]] = {}

        # History of recent observations (circular buffer per sensor)
        self.recent_telemetry: List[Dict[str, Any]] = []
        self.max_history = 1000

        # Latency trackers
        self.edge_latencies: Dict[str, float] = {}
        self.fog_latencies: Dict[str, float] = {}

        # Correlated regional events
        self.regional_events: List[Dict[str, Any]] = []

        self._init_network()
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        self._initialized = True
        print("[+] VirtualSensorNetwork initialized with 30 sensors and 5 fog gateways.")

    def _init_network(self):
        for s in VIRTUAL_SENSORS:
            sid = s["sensor_id"]
            self.sensor_states[sid] = {
                "sensor_id": sid,
                "edge_id": s["edge_id"],
                "corridor_id": s["corridor_id"],
                "zone_id": s["zone_id"],
                "intersection_name": s["intersection_name"],
                "lat": s["lat"],
                "lng": s["lng"],
                "base_speed": s["base_speed"],
                "current_speed": float(s["base_speed"]),
                "vehicle_count": 45,
                "density_vpm": 25.0,
                "queue_length_m": 15.0,
                "arrival_rate_vpm": 30.0,
                "congestion_index": 12.0,
                "operating_status": "NORMAL",  # NORMAL, CONGESTED, ANOMALY, DISCONNECTED, INCIDENT
                "is_connected": True,
                "anomaly_score": 0.05,
                "is_anomaly": False,
                "buffer_count": 0,
                "last_updated": datetime.utcnow().isoformat() + "Z",
                "data_source": "VIRTUAL_SENSOR",
                "is_simulated": True
            }
            self.edge_buffers[s["edge_id"]] = []
            self.edge_latencies[s["edge_id"]] = round(random.uniform(3.5, 9.8), 2)

        for z in FOG_ZONES:
            zid = z["id"]
            self.fog_states[zid] = {
                "zone_id": zid,
                "name": z["name"],
                "lat": z["lat"],
                "lng": z["lng"],
                "status": "ONLINE",
                "connected_edges": len(z["edge_nodes"]),
                "avg_speed_kmh": 50.0,
                "total_flow_vph": 2500,
                "avg_congestion_index": 20.0,
                "active_anomalies": 0,
                "edge_to_fog_latency_ms": round(random.uniform(8.0, 15.0), 2),
                "fog_to_cloud_latency_ms": round(random.uniform(22.0, 38.0), 2),
                "propagation_event": None
            }
            self.fog_latencies[zid] = self.fog_states[zid]["edge_to_fog_latency_ms"]

    def _run_loop(self):
        while self.running:
            if not self.paused:
                try:
                    self._generate_tick()
                except Exception as e:
                    print(f"[!] Error in VirtualSensorNetwork tick: {e}")
            time.sleep(self.interval)

    def _generate_tick(self):
        self.tick_count += 1
        now = datetime.utcnow()
        now_iso = now.isoformat() + "Z"
        hour_fraction = now.hour + now.minute / 60.0 + now.second / 3600.0

        # Diurnal pattern (Chennai traffic morning 8:30-11:30, evening 17:30-21:00)
        # Shift slightly so demo shows active realistic flow
        # Simulated diurnal curve
        t_param = (self.tick_count % 360) / 15.0  # cycles smoothly for demo dynamics
        m_curve = math.exp(-((math.sin(t_param)) ** 2) * 2.5)

        zone_aggregations = {z["id"]: {"speeds": [], "counts": [], "cis": [], "anomalies": 0} for z in FOG_ZONES}

        for sid, state in self.sensor_states.items():
            edge_id = state["edge_id"]
            zone_id = state["zone_id"]

            # Check disconnection
            if sid in self.disconnected_sensors:
                state["is_connected"] = False
                state["operating_status"] = "DISCONNECTED"
                state["buffer_count"] += 1
                # store offline buffered telemetry
                buffered_reading = {
                    "sensor_id": sid,
                    "timestamp": now_iso,
                    "speed": state["current_speed"],
                    "buffered_at": now_iso
                }
                if len(self.edge_buffers[edge_id]) < 500:
                    self.edge_buffers[edge_id].append(buffered_reading)
                continue
            else:
                state["is_connected"] = True
                if state["buffer_count"] > 0:
                    # Flush buffer
                    state["buffer_count"] = max(0, state["buffer_count"] - 5)
                    self.edge_buffers[edge_id] = self.edge_buffers[edge_id][5:]

            # Base parameters
            base_speed = state["base_speed"]
            noise = random.uniform(-2.5, 2.5)

            # Check if active incident or fault injection exists on this sensor
            incident = self.active_incidents.get(sid)
            if incident:
                severity = incident.get("severity", "CRITICAL")
                if severity == "CRITICAL":
                    speed = max(6.0, base_speed * 0.22 + noise)
                    state["operating_status"] = "INCIDENT"
                    queue = random.uniform(350, 750)
                    ci = random.uniform(78, 98)
                elif severity == "WARNING":
                    speed = max(18.0, base_speed * 0.5 + noise)
                    state["operating_status"] = "CONGESTED"
                    queue = random.uniform(150, 320)
                    ci = random.uniform(55, 75)
                else:
                    speed = max(25.0, base_speed * 0.7 + noise)
                    state["operating_status"] = "CONGESTED"
                    queue = random.uniform(80, 160)
                    ci = random.uniform(40, 58)
                veh_count = int(random.uniform(80, 130))
                anomaly_score = random.uniform(0.72, 0.95)
                is_anomaly = True
            else:
                # Normal diurnal variation
                speed_mod = 1.0 - (m_curve * 0.35)
                speed = max(15.0, min(base_speed * 1.05, (base_speed * speed_mod) + noise))
                queue = max(0.0, (base_speed - speed) * 7.5 + random.uniform(0, 15))
                veh_count = int(random.uniform(25, 75) * (0.8 + m_curve * 0.8))
                ci = max(0.0, min(100.0, (1.0 - (speed / base_speed)) * 85 + (queue / 25.0)))

                # Anomaly check
                if random.random() < 0.03:  # sporadic slight anomaly
                    anomaly_score = random.uniform(0.55, 0.72)
                    is_anomaly = True
                    state["operating_status"] = "ANOMALY"
                else:
                    anomaly_score = random.uniform(0.02, 0.28)
                    is_anomaly = False
                    if ci >= 70:
                        state["operating_status"] = "CONGESTED"
                    elif ci >= 40:
                        state["operating_status"] = "MODERATE"
                    else:
                        state["operating_status"] = "NORMAL"

            density = min(160.0, (veh_count * 12.0) / max(8.0, speed))
            arrival_rate = veh_count * 0.8 + random.uniform(-2, 3)

            # Update sensor state
            state["current_speed"] = round(speed, 1)
            state["vehicle_count"] = veh_count
            state["density_vpm"] = round(density, 1)
            state["queue_length_m"] = round(queue, 1)
            state["arrival_rate_vpm"] = round(arrival_rate, 1)
            state["congestion_index"] = round(ci, 1)
            state["anomaly_score"] = round(anomaly_score, 3)
            state["is_anomaly"] = is_anomaly
            state["last_updated"] = now_iso

            # Edge latency jitter
            self.edge_latencies[edge_id] = round(random.uniform(4.0, 11.5), 1)

            # Aggregate to zone
            zone_aggregations[zone_id]["speeds"].append(speed)
            zone_aggregations[zone_id]["counts"].append(veh_count)
            zone_aggregations[zone_id]["cis"].append(ci)
            if is_anomaly or ci > 70:
                zone_aggregations[zone_id]["anomalies"] += 1

            # Append to telemetry history
            telemetry_snapshot = dict(state)
            self.recent_telemetry.append(telemetry_snapshot)

            # Persist to AWS DynamoDB if in AWS_MODE (sampled every 3 ticks)
            if self.tick_count % 3 == 0 and (is_anomaly or ci > 50 or sid == "S01"):
                try:
                    from backend.app.integrations.aws_adapter import aws_adapter
                    if aws_adapter.mode == "AWS_MODE":
                        aws_adapter.persist_sensor_reading(telemetry_snapshot)
                except Exception:
                    pass

        # Trim telemetry
        if len(self.recent_telemetry) > self.max_history:
            self.recent_telemetry = self.recent_telemetry[-self.max_history:]

        # Update Fog Gateway aggregations & Congestion Propagation Detection
        for zid, agg in zone_aggregations.items():
            f_state = self.fog_states[zid]
            speeds = agg["speeds"]
            counts = agg["counts"]
            cis = agg["cis"]

            if speeds:
                f_state["avg_speed_kmh"] = round(sum(speeds) / len(speeds), 1)
                f_state["total_flow_vph"] = int(sum(counts) * 12)
                f_state["avg_congestion_index"] = round(sum(cis) / len(cis), 1)
                f_state["active_anomalies"] = agg["anomalies"]
                f_state["edge_to_fog_latency_ms"] = round(random.uniform(9.0, 16.5), 1)
                f_state["fog_to_cloud_latency_ms"] = round(random.uniform(20.0, 36.0), 1)

            # Spatial Congestion Propagation Detection
            # If 2 or more adjacent sensors in the same corridor are heavily congested,
            # detect a propagating bottleneck wave!
            propagation = self._check_congestion_propagation(zid)
            f_state["propagation_event"] = propagation

    def _check_congestion_propagation(self, zone_id: str) -> Optional[Dict[str, Any]]:
        """
        Detects if contiguous nodes along a corridor in this zone are forming a backward shockwave.
        """
        sensors_in_zone = [s for s in self.sensor_states.values() if s["zone_id"] == zone_id]
        # Group by corridor
        by_corridor = {}
        for s in sensors_in_zone:
            by_corridor.setdefault(s["corridor_id"], []).append(s)

        for corr_id, c_sensors in by_corridor.items():
            congested_count = sum(1 for s in c_sensors if s["congestion_index"] >= 65 or s["is_anomaly"])
            if congested_count >= 2:
                event = {
                    "corridor_id": corr_id,
                    "zone_id": zone_id,
                    "congested_nodes": [s["sensor_id"] for s in c_sensors if s["congestion_index"] >= 65 or s["is_anomaly"]],
                    "severity": "HIGH" if congested_count >= 3 else "MEDIUM",
                    "propagation_velocity_kmh": round(random.uniform(-14.0, -8.0), 1),  # backward shockwave
                    "message": f"Regional propagation detected: {congested_count} contiguous nodes on {corr_id} experiencing correlated bottleneck shockwave.",
                    "detected_at": datetime.utcnow().isoformat() + "Z"
                }
                # Keep event in list if not already there
                if not any(e["corridor_id"] == corr_id and e["zone_id"] == zone_id for e in self.regional_events):
                    self.regional_events.append(event)
                    if len(self.regional_events) > 50:
                        self.regional_events.pop(0)
                return event
        return None

    # CONTROL APIS
    def start(self):
        self.running = True
        self.paused = False
        return {"status": "RUNNING", "interval": self.interval}

    def pause(self):
        self.paused = True
        return {"status": "PAUSED"}

    def resume(self):
        self.paused = False
        return {"status": "RUNNING"}

    def stop(self):
        self.running = False
        return {"status": "STOPPED"}

    def set_interval(self, seconds: float):
        self.interval = max(0.5, min(10.0, float(seconds)))
        return {"interval": self.interval}

    def inject_congestion(self, target_id: str, severity: str = "CRITICAL"):
        """Target can be corridor_id or sensor_id."""
        severity = severity.upper()
        affected = []
        if target_id in self.sensor_states:
            self.active_incidents[target_id] = {
                "sensor_id": target_id,
                "type": "CONGESTION_INJECTION",
                "severity": severity,
                "description": f"Manual congestion shock injected at {self.sensor_states[target_id]['intersection_name']}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            affected.append(target_id)
        else:
            # Check corridor
            for sid, s in self.sensor_states.items():
                if s["corridor_id"] == target_id:
                    self.active_incidents[sid] = {
                        "sensor_id": sid,
                        "type": "CORRIDOR_CONGESTION",
                        "severity": severity,
                        "description": f"Corridor gridlock injected across {target_id}",
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                    affected.append(sid)
        return {"affected_sensors": affected, "severity": severity, "status": "INJECTED"}

    def simulate_incident(self, sensor_id: str, incident_type: str = "VEHICLE_ACCIDENT", description: str = ""):
        if sensor_id not in self.sensor_states:
            return {"error": f"Sensor {sensor_id} not found"}

        name = self.sensor_states[sensor_id]["intersection_name"]
        desc = description or f"{incident_type.replace('_', ' ').title()} blocking 2 lanes at {name}"
        self.active_incidents[sensor_id] = {
            "sensor_id": sensor_id,
            "type": incident_type,
            "severity": "CRITICAL",
            "description": desc,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        return {"sensor_id": sensor_id, "incident": self.active_incidents[sensor_id]}

    def clear_incident(self, sensor_id: str):
        if sensor_id in self.active_incidents:
            del self.active_incidents[sensor_id]
            return {"sensor_id": sensor_id, "cleared": True}
        return {"cleared": False}

    def clear_all_incidents(self):
        count = len(self.active_incidents)
        self.active_incidents.clear()
        self.regional_events.clear()
        return {"cleared_count": count}

    def disconnect_sensor(self, sensor_id: str):
        if sensor_id in self.sensor_states:
            self.disconnected_sensors.add(sensor_id)
            return {"sensor_id": sensor_id, "status": "DISCONNECTED"}
        return {"error": f"Sensor {sensor_id} not found"}

    def restore_connection(self, sensor_id: str):
        if sensor_id in self.disconnected_sensors:
            self.disconnected_sensors.remove(sensor_id)
            return {"sensor_id": sensor_id, "status": "CONNECTED"}
        return {"status": "ALREADY_CONNECTED"}

# Singleton accessor
simulator = VirtualSensorNetwork()

