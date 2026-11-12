from fastapi import APIRouter
from typing import Dict, Any

from backend.app.services.ml_service import ml_service

router = APIRouter()

@router.get("/models")
def get_ml_models() -> Dict[str, Any]:
    return {
        "status": "LOADED" if ml_service.loaded else "UNINITIALIZED",
        "metadata": ml_service.metadata,
        "active_models": [
            {"id": "xgb_forecast_15m", "name": "XGBoost 15m Horizon Forecaster", "type": "Regression", "status": "ACTIVE"},
            {"id": "xgb_forecast_5m", "name": "XGBoost 5m Horizon Forecaster", "type": "Regression", "status": "ACTIVE"},
            {"id": "xgb_forecast_30m", "name": "XGBoost 30m Horizon Forecaster", "type": "Regression", "status": "ACTIVE"},
            {"id": "rf_forecast_15m", "name": "Random Forest 15m Benchmark", "type": "Regression", "status": "BENCHMARK"},
            {"id": "isolation_forest", "name": "Isolation Forest Anomaly Detector", "type": "Unsupervised Anomaly", "status": "ACTIVE"},
            {"id": "congestion_classifier", "name": "Congestion Level Classifier", "type": "Classification", "status": "ACTIVE"}
        ]
    }

@router.get("/metrics")
def get_ml_metrics() -> Dict[str, Any]:
    return ml_service.get_evaluation_metrics()

@router.get("/feature-importances")
def get_feature_importances() -> Dict[str, float]:
    return ml_service.get_feature_importances()

