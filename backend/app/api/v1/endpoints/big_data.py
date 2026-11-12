from fastapi import APIRouter
from typing import Dict, List, Any

from streaming.ingestion.data_lake_manager import data_lake

router = APIRouter()

@router.get("/stats")
def get_data_lake_stats() -> Dict[str, Any]:
    return data_lake.get_statistics()

@router.get("/hourly")
def get_hourly_analytics() -> List[Dict[str, Any]]:
    return data_lake.query_hourly_volume()

@router.get("/corridors")
def get_corridor_comparisons() -> List[Dict[str, Any]]:
    return data_lake.query_corridor_comparison()

