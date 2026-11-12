from fastapi import APIRouter
from typing import Dict, Any

from backend.app.services.distributed_benchmark_service import distributed_benchmark

router = APIRouter()

@router.get("/benchmark")
def get_distributed_benchmark() -> Dict[str, Any]:
    return distributed_benchmark.run_benchmark()

