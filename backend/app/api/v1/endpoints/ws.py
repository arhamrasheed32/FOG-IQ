"""
FOG-IQ Real-Time WebSocket Telemetry Broadcast Engine
Streams live sensor readings, fog gateway aggregations, edge status,
and real-time alerts directly to the connected React dashboard.
"""

import asyncio
import json
from datetime import datetime
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from edge.simulator.virtual_sensor_network import simulator
from backend.app.services.alert_service import alert_service
from backend.app.services.ml_service import ml_service

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        payload = json.dumps(message)
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.active_connections.discard(d)

manager = ConnectionManager()

@router.websocket("/ws/traffic")
async def websocket_traffic_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Gather live data from simulator
            sensors = list(simulator.sensor_states.values())
            fog_zones = list(simulator.fog_states.values())
            recent_alerts = alert_service.get_alerts(status="ACTIVE")[:10]

            # Fast aggregate
            total_sensors = len(sensors)
            avg_speed = round(sum(s["current_speed"] for s in sensors) / max(1, total_sensors), 1)
            avg_ci = round(sum(s["congestion_index"] for s in sensors) / max(1, total_sensors), 1)
            anomalies = sum(1 for s in sensors if s["is_anomaly"])

            payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "summary": {
                    "avg_speed_kmh": avg_speed,
                    "avg_congestion_index": avg_ci,
                    "active_anomalies": anomalies,
                    "connected_sensors": sum(1 for s in sensors if s["is_connected"]),
                    "total_sensors": total_sensors,
                    "ticks": simulator.tick_count
                },
                "sensors": sensors,
                "fog_zones": fog_zones,
                "propagation_events": simulator.regional_events,
                "alerts": recent_alerts
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(simulator.interval)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)

