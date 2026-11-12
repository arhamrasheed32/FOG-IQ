from fastapi import APIRouter, Query, Body
from typing import Dict, List, Any, Optional

from backend.app.core.chennai_network import CORRIDORS, FOG_ZONES
from edge.simulator.virtual_sensor_network import simulator
from backend.app.services.ml_service import ml_service

router = APIRouter()

@router.get("/sensors")
def get_all_sensors(corridor_id: Optional[str] = None) -> List[Dict[str, Any]]:
    sensors = list(simulator.sensor_states.values())
    if corridor_id:
        sensors = [s for s in sensors if s["corridor_id"] == corridor_id]
    return sensors

@router.get("/sensors/{sensor_id}")
def get_sensor_detail(sensor_id: str) -> Dict[str, Any]:
    if sensor_id not in simulator.sensor_states:
        return {"error": f"Sensor {sensor_id} not found"}
    s_state = simulator.sensor_states[sensor_id]
    forecast = ml_service.predict_forecast(s_state)
    return {
        "sensor": s_state,
        "forecast": forecast,
        "buffer_queue": simulator.edge_buffers.get(s_state["edge_id"], []),
        "edge_latency_ms": simulator.edge_latencies.get(s_state["edge_id"], 5.0)
    }

@router.get("/corridors")
def get_corridors() -> List[Dict[str, Any]]:
    enriched = []
    for c in CORRIDORS:
        c_sensors = [s for s in simulator.sensor_states.values() if s["corridor_id"] == c["id"]]
        if c_sensors:
            avg_speed = round(sum(s["current_speed"] for s in c_sensors) / len(c_sensors), 1)
            avg_ci = round(sum(s["congestion_index"] for s in c_sensors) / len(c_sensors), 1)
            total_queue = round(sum(s["queue_length_m"] for s in c_sensors), 1)
            congested_count = sum(1 for s in c_sensors if s["congestion_index"] >= 60)
        else:
            avg_speed, avg_ci, total_queue, congested_count = 50.0, 15.0, 0.0, 0

        enriched.append({
            **c,
            "current_speed_kmh": avg_speed,
            "congestion_index": avg_ci,
            "total_queue_m": total_queue,
            "congested_bottlenecks": congested_count,
            "status": "SEVERE" if avg_ci >= 75 else ("MODERATE" if avg_ci >= 45 else "FREE_FLOW"),
            "data_source": "VIRTUAL_SENSOR"
        })
    return enriched

@router.get("/fog-zones")
def get_fog_zones() -> List[Dict[str, Any]]:
    return list(simulator.fog_states.values())

@router.post("/simulator/control")
def control_simulator(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    action = payload.get("action", "").lower()
    if action == "start":
        return simulator.start()
    elif action == "pause":
        return simulator.pause()
    elif action == "resume":
        return simulator.resume()
    elif action == "stop":
        return simulator.stop()
    elif action == "interval":
        sec = payload.get("seconds", 1.8)
        return simulator.set_interval(sec)
    elif action == "inject_congestion":
        target = payload.get("target", "ANNA_SALAI")
        sev = payload.get("severity", "CRITICAL")
        return simulator.inject_congestion(target, sev)
    elif action == "simulate_incident":
        sid = payload.get("sensor_id", "S03")
        inc_type = payload.get("incident_type", "VEHICLE_ACCIDENT")
        desc = payload.get("description", "")
        return simulator.simulate_incident(sid, inc_type, desc)
    elif action == "disconnect":
        sid = payload.get("sensor_id", "S01")
        return simulator.disconnect_sensor(sid)
    elif action == "restore":
        sid = payload.get("sensor_id", "S01")
        return simulator.restore_connection(sid)
    elif action == "clear_all":
        return simulator.clear_all_incidents()
    else:
        return {"error": f"Unknown action: {action}"}

