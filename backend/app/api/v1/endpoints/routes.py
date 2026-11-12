from fastapi import APIRouter, Body
from typing import Dict, Any

from backend.app.services.google_maps_service import google_maps_service

router = APIRouter()

@router.post("/calculate")
def calculate_route(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    origin = payload.get("origin", "Chennai Central Railway Station")
    destination = payload.get("destination", "Tidel Park (OMR)")
    departure_time = payload.get("departure_time")

    return google_maps_service.calculate_traffic_aware_route(
        origin=origin,
        destination=destination,
        departure_time=departure_time
    )

