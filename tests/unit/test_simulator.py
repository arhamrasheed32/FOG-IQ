import pytest
import time
from edge.simulator.virtual_sensor_network import VirtualSensorNetwork

def test_simulator_initialization():
    sim = VirtualSensorNetwork()
    assert len(sim.sensor_states) == 30
    assert len(sim.fog_states) == 5
    assert sim.running is True

def test_fault_injection():
    sim = VirtualSensorNetwork()
    # Inject congestion on Anna Salai
    res = sim.inject_congestion("ANNA_SALAI", "CRITICAL")
    assert res["status"] == "INJECTED"
    assert len(res["affected_sensors"]) == 6

    # Verify sensor state updated
    s_id = res["affected_sensors"][0]
    assert sim.active_incidents[s_id]["severity"] == "CRITICAL"

    # Clear
    sim.clear_all_incidents()
    assert len(sim.active_incidents) == 0

def test_sensor_disconnection_and_reconnection():
    sim = VirtualSensorNetwork()
    target_sensor = "S01"

    # Disconnect
    res = sim.disconnect_sensor(target_sensor)
    assert res["status"] == "DISCONNECTED"
    assert target_sensor in sim.disconnected_sensors

    # Run tick
    sim._generate_tick()
    edge_id = sim.sensor_states[target_sensor]["edge_id"]
    assert sim.sensor_states[target_sensor]["is_connected"] is False
    assert sim.sensor_states[target_sensor]["buffer_count"] > 0
    assert len(sim.edge_buffers[edge_id]) > 0

    # Reconnect
    res = sim.restore_connection(target_sensor)
    assert res["status"] == "CONNECTED"
    assert target_sensor not in sim.disconnected_sensors

    # Run tick after reconnect to flush buffer
    sim._generate_tick()
    assert sim.sensor_states[target_sensor]["is_connected"] is True

