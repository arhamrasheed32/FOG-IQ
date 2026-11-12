import pytest
from backend.app.services.ml_service import ml_service

def test_ml_service_loaded():
    assert ml_service.loaded is True
    assert ml_service.model_5m is not None
    assert ml_service.model_15m is not None
    assert ml_service.model_30m is not None

def test_ml_forecast_prediction():
    sample_sensor = {
        "sensor_id": "S03",
        "corridor_id": "ANNA_SALAI",
        "current_speed": 22.0,
        "base_speed": 45.0,
        "queue_length_m": 250.0,
        "congestion_index": 68.0
    }
    pred = ml_service.predict_forecast(sample_sensor)
    assert "forecast_5m_ci" in pred
    assert "forecast_15m_ci" in pred
    assert "forecast_30m_ci" in pred
    assert "predicted_speed_15m" in pred
    assert "congestion_category" in pred
    assert len(pred["confidence_interval"]) == 2
    assert 0 <= pred["forecast_15m_ci"] <= 100

def test_ml_evaluation_metrics():
    metrics = ml_service.get_evaluation_metrics()
    assert "models" in metrics
    assert "xgboost_15m" in metrics["models"]
    xgb_m = metrics["models"]["xgboost_15m"]
    assert xgb_m["r2"] > 0.85
    assert xgb_m["mae"] < 8.0
    assert "feature_importances" in xgb_m

