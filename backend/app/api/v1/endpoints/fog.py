from fastapi import APIRouter
from typing import Dict, List, Any

from edge.simulator.virtual_sensor_network import simulator

router = APIRouter()

@router.get("/gateways")
def get_fog_gateways() -> List[Dict[str, Any]]:
    gateways = []
    for zid, f in simulator.fog_states.items():
        gateways.append({
            **f,
            "regional_propagation_detected": f["propagation_event"] is not None
        })
    return gateways

@router.get("/propagation-events")
def get_propagation_events() -> List[Dict[str, Any]]:
    return simulator.regional_events

