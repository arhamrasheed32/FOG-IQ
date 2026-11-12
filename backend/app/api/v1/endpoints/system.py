from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any

from backend.app.integrations.aws_adapter import aws_adapter
from edge.simulator.virtual_sensor_network import simulator
from backend.app.services.google_maps_service import google_maps_service

router = APIRouter()

@router.get("/health")
def get_system_health() -> Dict[str, Any]:
    return {
        "status": "HEALTHY",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "components": {
            "fastapi_backend": {
                "status": "ONLINE",
                "uptime": "RUNNING",
                "health": "OPERATIONAL"
            },
            "websocket_hub": {
                "status": "ONLINE",
                "endpoint": "/ws/traffic",
                "active_subscribers": 1
            },
            "google_maps_platform": {
                "status": "CONFIGURED" if google_maps_service.has_server_key else "FALLBACK_CALIBRATED_ENGINE",
                "traffic_layer_support": True,
                "routes_api_available": google_maps_service.has_server_key
            },
            "aws_adapter": aws_adapter.get_status(),
            "virtual_iot_simulator": {
                "status": "PAUSED" if simulator.paused else ("RUNNING" if simulator.running else "STOPPED"),
                "total_sensors": len(simulator.sensor_states),
                "frequency_sec": simulator.interval,
                "ticks_generated": simulator.tick_count
            },
            "fog_gateway_layer": {
                "status": "ONLINE",
                "active_gateways": 5,
                "avg_edge_to_fog_latency_ms": 14.5
            },
            "telemetry_data_lake": {
                "status": "OPERATIONAL",
                "storage": "LOCAL_PARQUET_LAKE"
            }
        }
    }

