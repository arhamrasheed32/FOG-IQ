from fastapi import APIRouter
from typing import Dict, List, Any

from edge.simulator.virtual_sensor_network import simulator

router = APIRouter()

@router.get("/devices")
def get_edge_devices() -> List[Dict[str, Any]]:
    devices = []
    for s in simulator.sensor_states.values():
        eid = s["edge_id"]
        devices.append({
            "edge_id": eid,
            "sensor_id": s["sensor_id"],
            "corridor_id": s["corridor_id"],
            "zone_id": s["zone_id"],
            "intersection_name": s["intersection_name"],
            "is_connected": s["is_connected"],
            "status": s["operating_status"],
            "local_anomaly_score": s["anomaly_score"],
            "is_anomaly": s["is_anomaly"],
            "processing_latency_ms": simulator.edge_latencies.get(eid, 6.2),
            "buffered_messages": s["buffer_count"],
            "runtime_mode": "LOCAL_PYTHON_EXECUTION",
            "greengrass_recipe": "com.fogiq.traffic.edge.processor"
        })
    return devices

