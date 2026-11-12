from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any

from backend.app.core.chennai_network import CHENNAI_CENTER, CORRIDORS, FOG_ZONES
from edge.simulator.virtual_sensor_network import simulator
from backend.app.services.alert_service import alert_service
from backend.app.integrations.aws_adapter import aws_adapter
from backend.app.services.ml_service import ml_service

router = APIRouter()

@router.get("/summary")
def get_command_center_summary() -> Dict[str, Any]:
    active_sensors = list(simulator.sensor_states.values())
    connected_count = sum(1 for s in active_sensors if s["is_connected"])
    congested_count = sum(1 for s in active_sensors if s["congestion_index"] >= 60)
    anomalies_count = sum(1 for s in active_sensors if s["is_anomaly"])

    avg_speed = round(sum(s["current_speed"] for s in active_sensors) / max(1, len(active_sensors)), 1)
    avg_ci = round(sum(s["congestion_index"] for s in active_sensors) / max(1, len(active_sensors)), 1)

    active_alerts = alert_service.get_alerts(status="ACTIVE")
    critical_alerts = [a for a in active_alerts if a["severity"] == "CRITICAL"]

    return {
        "city": "Chennai, Tamil Nadu, India",
        "viewport": CHENNAI_CENTER,
        "traffic_condition": "SEVERE" if avg_ci >= 70 else ("MODERATE" if avg_ci >= 45 else "FREE_FLOW"),
        "city_congestion_index": avg_ci,
        "city_average_speed_kmh": avg_speed,
        "active_corridors_monitored": len(CORRIDORS),
        "total_virtual_sensors": len(active_sensors),
        "connected_sensors": connected_count,
        "disconnected_sensors": len(active_sensors) - connected_count,
        "congested_nodes": congested_count,
        "active_anomalies": anomalies_count,
        "active_alerts_count": len(active_alerts),
        "critical_alerts_count": len(critical_alerts),
        "fog_gateways_online": sum(1 for f in simulator.fog_states.values() if f["status"] == "ONLINE"),
        "regional_propagation_events": len(simulator.regional_events),
        "aws_mode": aws_adapter.mode,
        "ml_model_version": ml_service.metadata.get("model_version", "v1.4.0"),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

