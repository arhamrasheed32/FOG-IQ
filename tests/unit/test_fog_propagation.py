import pytest
from edge.simulator.virtual_sensor_network import VirtualSensorNetwork

def test_fog_spatial_aggregation():
    sim = VirtualSensorNetwork()
    sim._generate_tick()

    for zid, fog in sim.fog_states.items():
        assert fog["status"] == "ONLINE"
        assert fog["connected_edges"] > 0
        assert fog["avg_speed_kmh"] > 0
        assert fog["total_flow_vph"] > 0
        assert fog["edge_to_fog_latency_ms"] > 0

def test_congestion_propagation_detection():
    sim = VirtualSensorNetwork()
    # Inject severe congestion on OMR corridor
    sim.inject_congestion("OMR", "CRITICAL")
    sim._generate_tick()

    # Fog Gateway south should detect regional propagation across adjacent OMR nodes
    south_fog = sim.fog_states["fog-gw-south"]
    assert south_fog["propagation_event"] is not None
    assert south_fog["propagation_event"]["corridor_id"] == "OMR"
    assert len(south_fog["propagation_event"]["congested_nodes"]) >= 2
    assert south_fog["propagation_event"]["propagation_velocity_kmh"] < 0  # backward shockwave

    # Clean up
    sim.clear_all_incidents()
    sim._generate_tick()

