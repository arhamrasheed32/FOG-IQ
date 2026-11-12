import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_command_center_summary():
    res = client.get("/api/v1/command-center/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["city"] == "Chennai, Tamil Nadu, India"
    assert data["total_virtual_sensors"] == 30
    assert data["fog_gateways_online"] == 5

def test_traffic_sensors_and_corridors():
    res_s = client.get("/api/v1/traffic/sensors")
    assert res_s.status_code == 200
    assert len(res_s.json()) == 30

    res_c = client.get("/api/v1/traffic/corridors")
    assert res_c.status_code == 200
    assert len(res_c.json()) >= 6

def test_routes_calculation():
    payload = {
        "origin": "Chennai Central Railway Station",
        "destination": "Tidel Park (OMR)"
    }
    res = client.post("/api/v1/routes/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["routes"]) >= 1
    assert data["routes"][0]["distance_km"] > 0
    assert data["routes"][0]["traffic_duration_min"] > 0

def test_ml_forecasting_endpoint():
    res = client.get("/api/v1/forecasting/predictions?corridor_id=ANNA_SALAI")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 6
    assert "forecast_15m_ci" in data[0]

def test_edge_and_fog_endpoints():
    res_e = client.get("/api/v1/edge/devices")
    assert res_e.status_code == 200
    assert len(res_e.json()) == 30

    res_f = client.get("/api/v1/fog/gateways")
    assert res_f.status_code == 200
    assert len(res_f.json()) == 5

def test_ml_lab_and_metrics():
    res_m = client.get("/api/v1/ml/models")
    assert res_m.status_code == 200
    assert res_m.json()["status"] == "LOADED"

    res_met = client.get("/api/v1/ml/metrics")
    assert res_met.status_code == 200
    assert "models" in res_met.json()

def test_big_data_and_alerts():
    res_b = client.get("/api/v1/big-data/stats")
    assert res_b.status_code == 200
    assert res_b.json()["total_records"] > 0

    res_a = client.get("/api/v1/alerts/")
    assert res_a.status_code == 200
    assert len(res_a.json()) > 0

def test_system_health_and_distributed():
    res_h = client.get("/api/v1/system/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "HEALTHY"

    res_d = client.get("/api/v1/distributed/benchmark")
    assert res_d.status_code == 200
    assert "strategies" in res_d.json()

