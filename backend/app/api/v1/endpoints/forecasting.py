from fastapi import APIRouter, Query
from typing import Dict, List, Any, Optional

from edge.simulator.virtual_sensor_network import simulator
from backend.app.services.ml_service import ml_service

router = APIRouter()

@router.get("/predictions")
def get_all_predictions(corridor_id: Optional[str] = None) -> List[Dict[str, Any]]:
    sensors = list(simulator.sensor_states.values())
    if corridor_id:
        sensors = [s for s in sensors if s["corridor_id"] == corridor_id]

    predictions = []
    for s in sensors:
        pred = ml_service.predict_forecast(s)
        predictions.append(pred)
    return predictions

@router.get("/sensor/{sensor_id}")
def get_sensor_prediction(sensor_id: str) -> Dict[str, Any]:
    if sensor_id not in simulator.sensor_states:
        return {"error": f"Sensor {sensor_id} not found"}
    s_state = simulator.sensor_states[sensor_id]
    return ml_service.predict_forecast(s_state)

