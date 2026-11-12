"""
FOG-IQ Chennai Intelligent Transportation Network Definitions
Contains ground-truth geospatial coordinates, arterial corridors,
regional fog zones, and 30 virtual sensor configurations.
"""

from typing import Dict, List, Any

CHENNAI_CENTER = {"lat": 13.0827, "lng": 80.2707, "zoom": 12}

FOG_ZONES = [
    {
        "id": "fog-gw-central",
        "name": "Central Chennai Fog Zone",
        "district": "Chennai Central (Anna Salai / T. Nagar)",
        "lat": 13.0604,
        "lng": 80.2496,
        "coverage_radius_km": 4.5,
        "edge_nodes": ["edge-dev-01", "edge-dev-02", "edge-dev-03", "edge-dev-04", "edge-dev-05", "edge-dev-06"],
        "status": "ONLINE",
        "processing_latency_ms": 14.2
    },
    {
        "id": "fog-gw-south",
        "name": "IT Expressway & South Fog Zone",
        "district": "OMR / Velachery / Sholinganallur",
        "lat": 12.9698,
        "lng": 80.2459,
        "coverage_radius_km": 8.0,
        "edge_nodes": ["edge-dev-07", "edge-dev-08", "edge-dev-09", "edge-dev-10", "edge-dev-11", "edge-dev-12", "edge-dev-28", "edge-dev-29", "edge-dev-30"],
        "status": "ONLINE",
        "processing_latency_ms": 16.5
    },
    {
        "id": "fog-gw-west",
        "name": "Western Logistics Corridor Fog Zone",
        "district": "Poonamallee High Rd / Koyambedu Hub",
        "lat": 13.0694,
        "lng": 80.1948,
        "coverage_radius_km": 6.0,
        "edge_nodes": ["edge-dev-19", "edge-dev-20", "edge-dev-21", "edge-dev-22", "edge-dev-23", "edge-dev-24"],
        "status": "ONLINE",
        "processing_latency_ms": 15.1
    },
    {
        "id": "fog-gw-airport-gst",
        "name": "Airport & Southern Gateway Fog Zone",
        "district": "GST Road / Meenambakkam / Tambaram",
        "lat": 12.9830,
        "lng": 80.1700,
        "coverage_radius_km": 7.5,
        "edge_nodes": ["edge-dev-13", "edge-dev-14", "edge-dev-15", "edge-dev-16", "edge-dev-17", "edge-dev-18"],
        "status": "ONLINE",
        "processing_latency_ms": 13.8
    },
    {
        "id": "fog-gw-north",
        "name": "Inner Ring & Port Gateway Fog Zone",
        "district": "Inner Ring Road / Vadapalani / North",
        "lat": 13.0450,
        "lng": 80.2110,
        "coverage_radius_km": 5.0,
        "edge_nodes": ["edge-dev-25", "edge-dev-26", "edge-dev-27"],
        "status": "ONLINE",
        "processing_latency_ms": 14.8
    }
]

CORRIDORS = [
    {
        "id": "ANNA_SALAI",
        "name": "Anna Salai (Mount Road)",
        "code": "CORR-01",
        "length_km": 14.2,
        "speed_limit_kmh": 60,
        "key_intersections": ["Napier Bridge", "Thousand Lights", "Gemini Flyover", "Teynampet Signal", "Nandanam Junction", "Saidapet Bridge"],
        "zone_id": "fog-gw-central",
        "color": "#55B9FF",
        "coordinates": [
            [13.0690, 80.2820],
            [13.0560, 80.2520],
            [13.0505, 80.2505],
            [13.0410, 80.2450],
            [13.0315, 80.2375],
            [13.0210, 80.2240]
        ]
    },
    {
        "id": "OMR",
        "name": "Old Mahabalipuram Road (IT Corridor)",
        "code": "CORR-02",
        "length_km": 20.5,
        "speed_limit_kmh": 70,
        "key_intersections": ["Madhya Kailash", "Tidel Park", "SRP Tools", "Perungudi Toll", "Thoraipakkam", "Sholinganallur"],
        "zone_id": "fog-gw-south",
        "color": "#8B7CFF",
        "coordinates": [
            [13.0067, 80.2470],
            [12.9895, 80.2485],
            [12.9790, 80.2495],
            [12.9650, 80.2470],
            [12.9430, 80.2390],
            [12.9010, 80.2280]
        ]
    },
    {
        "id": "GST_ROAD",
        "name": "Grand Southern Trunk (GST) Road",
        "code": "CORR-03",
        "length_km": 18.0,
        "speed_limit_kmh": 70,
        "key_intersections": ["Kathipara Cloverleaf", "Guindy Station", "Meenambakkam Airport", "Pallavaram Flyover", "Chromepet MIT", "Tambaram Sanatorium"],
        "zone_id": "fog-gw-airport-gst",
        "color": "#25C58A",
        "coordinates": [
            [13.0070, 80.2030],
            [13.0090, 80.2130],
            [12.9820, 80.1640],
            [12.9680, 80.1470],
            [12.9520, 80.1410],
            [12.9340, 80.1260]
        ]
    },
    {
        "id": "POONAMALLEE_HIGH",
        "name": "Poonamallee High Road (EVR Periyar)",
        "code": "CORR-04",
        "length_km": 16.0,
        "speed_limit_kmh": 50,
        "key_intersections": ["Chennai Central", "Kilpauk Medical", "Aminjikarai", "Koyambedu Roundabout", "Maduravoyal Flyover", "Porur Link"],
        "zone_id": "fog-gw-west",
        "color": "#F5B942",
        "coordinates": [
            [13.0827, 80.2755],
            [13.0780, 80.2420],
            [13.0730, 80.2200],
            [13.0694, 80.1948],
            [13.0640, 80.1650],
            [13.0550, 80.1450]
        ]
    },
    {
        "id": "INNER_RING",
        "name": "Inner Ring Road (100 Feet Road)",
        "code": "CORR-05",
        "length_km": 11.5,
        "speed_limit_kmh": 60,
        "key_intersections": ["Vadapalani Junction", "Ashok Pillar", "Kasi Theatre Bridge", "Kathipara Link"],
        "zone_id": "fog-gw-north",
        "color": "#00F0FF",
        "coordinates": [
            [13.0500, 80.2120],
            [13.0340, 80.2110],
            [13.0240, 80.2070],
            [13.0070, 80.2030]
        ]
    },
    {
        "id": "VELACHERY_MAIN",
        "name": "Velachery Main Road",
        "code": "CORR-06",
        "length_km": 9.5,
        "speed_limit_kmh": 45,
        "key_intersections": ["Guindy Race Course", "Dhandeeswaram Signal", "Vijayanagar Bus Stand", "Kaiveli Signal"],
        "zone_id": "fog-gw-south",
        "color": "#EC4899",
        "coordinates": [
            [12.9980, 80.2180],
            [12.9780, 80.2210],
            [12.9690, 80.2190],
            [12.9550, 80.2050]
        ]
    }
]

VIRTUAL_SENSORS = [
    # Anna Salai (6 sensors)
    {"sensor_id": "S01", "edge_id": "edge-dev-01", "corridor_id": "ANNA_SALAI", "zone_id": "fog-gw-central", "intersection_name": "Anna Salai - Napier Bridge", "lat": 13.0690, "lng": 80.2820, "base_speed": 55},
    {"sensor_id": "S02", "edge_id": "edge-dev-02", "corridor_id": "ANNA_SALAI", "zone_id": "fog-gw-central", "intersection_name": "Anna Salai - Thousand Lights", "lat": 13.0560, "lng": 80.2520, "base_speed": 50},
    {"sensor_id": "S03", "edge_id": "edge-dev-03", "corridor_id": "ANNA_SALAI", "zone_id": "fog-gw-central", "intersection_name": "Anna Salai - Gemini Flyover", "lat": 13.0505, "lng": 80.2505, "base_speed": 45},
    {"sensor_id": "S04", "edge_id": "edge-dev-04", "corridor_id": "ANNA_SALAI", "zone_id": "fog-gw-central", "intersection_name": "Anna Salai - Teynampet Signal", "lat": 13.0410, "lng": 80.2450, "base_speed": 45},
    {"sensor_id": "S05", "edge_id": "edge-dev-05", "corridor_id": "ANNA_SALAI", "zone_id": "fog-gw-central", "intersection_name": "Anna Salai - Nandanam Junction", "lat": 13.0315, "lng": 80.2375, "base_speed": 50},
    {"sensor_id": "S06", "edge_id": "edge-dev-06", "corridor_id": "ANNA_SALAI", "zone_id": "fog-gw-central", "intersection_name": "Anna Salai - Saidapet Bridge", "lat": 13.0210, "lng": 80.2240, "base_speed": 55},

    # OMR (6 sensors)
    {"sensor_id": "S07", "edge_id": "edge-dev-07", "corridor_id": "OMR", "zone_id": "fog-gw-south", "intersection_name": "OMR - Madhya Kailash", "lat": 13.0067, "lng": 80.2470, "base_speed": 70},
    {"sensor_id": "S08", "edge_id": "edge-dev-08", "corridor_id": "OMR", "zone_id": "fog-gw-south", "intersection_name": "OMR - Tidel Park Junction", "lat": 12.9895, "lng": 80.2485, "base_speed": 60},
    {"sensor_id": "S09", "edge_id": "edge-dev-09", "corridor_id": "OMR", "zone_id": "fog-gw-south", "intersection_name": "OMR - SRP Tools Signal", "lat": 12.9790, "lng": 80.2495, "base_speed": 55},
    {"sensor_id": "S10", "edge_id": "edge-dev-10", "corridor_id": "OMR", "zone_id": "fog-gw-south", "intersection_name": "OMR - Perungudi Toll Plaza", "lat": 12.9650, "lng": 80.2470, "base_speed": 60},
    {"sensor_id": "S11", "edge_id": "edge-dev-11", "corridor_id": "OMR", "zone_id": "fog-gw-south", "intersection_name": "OMR - Thoraipakkam Junction", "lat": 12.9430, "lng": 80.2390, "base_speed": 65},
    {"sensor_id": "S12", "edge_id": "edge-dev-12", "corridor_id": "OMR", "zone_id": "fog-gw-south", "intersection_name": "OMR - Sholinganallur Junction", "lat": 12.9010, "lng": 80.2280, "base_speed": 70},

    # GST Road (6 sensors)
    {"sensor_id": "S13", "edge_id": "edge-dev-13", "corridor_id": "GST_ROAD", "zone_id": "fog-gw-airport-gst", "intersection_name": "GST Road - Kathipara Cloverleaf", "lat": 13.0070, "lng": 80.2030, "base_speed": 75},
    {"sensor_id": "S14", "edge_id": "edge-dev-14", "corridor_id": "GST_ROAD", "zone_id": "fog-gw-airport-gst", "intersection_name": "GST Road - Guindy Station", "lat": 13.0090, "lng": 80.2130, "base_speed": 65},
    {"sensor_id": "S15", "edge_id": "edge-dev-15", "corridor_id": "GST_ROAD", "zone_id": "fog-gw-airport-gst", "intersection_name": "GST Road - Meenambakkam Airport", "lat": 12.9820, "lng": 80.1640, "base_speed": 70},
    {"sensor_id": "S16", "edge_id": "edge-dev-16", "corridor_id": "GST_ROAD", "zone_id": "fog-gw-airport-gst", "intersection_name": "GST Road - Pallavaram Flyover", "lat": 12.9680, "lng": 80.1470, "base_speed": 60},
    {"sensor_id": "S17", "edge_id": "edge-dev-17", "corridor_id": "GST_ROAD", "zone_id": "fog-gw-airport-gst", "intersection_name": "GST Road - Chromepet MIT Gate", "lat": 12.9520, "lng": 80.1410, "base_speed": 55},
    {"sensor_id": "S18", "edge_id": "edge-dev-18", "corridor_id": "GST_ROAD", "zone_id": "fog-gw-airport-gst", "intersection_name": "GST Road - Tambaram Sanatorium", "lat": 12.9340, "lng": 80.1260, "base_speed": 65},

    # Poonamallee High Road (6 sensors)
    {"sensor_id": "S19", "edge_id": "edge-dev-19", "corridor_id": "POONAMALLEE_HIGH", "zone_id": "fog-gw-west", "intersection_name": "PH Road - Chennai Central Gateway", "lat": 13.0827, "lng": 80.2755, "base_speed": 50},
    {"sensor_id": "S20", "edge_id": "edge-dev-20", "corridor_id": "POONAMALLEE_HIGH", "zone_id": "fog-gw-west", "intersection_name": "PH Road - Kilpauk Medical College", "lat": 13.0780, "lng": 80.2420, "base_speed": 45},
    {"sensor_id": "S21", "edge_id": "edge-dev-21", "corridor_id": "POONAMALLEE_HIGH", "zone_id": "fog-gw-west", "intersection_name": "PH Road - Aminjikarai Tollgate", "lat": 13.0730, "lng": 80.2200, "base_speed": 45},
    {"sensor_id": "S22", "edge_id": "edge-dev-22", "corridor_id": "POONAMALLEE_HIGH", "zone_id": "fog-gw-west", "intersection_name": "PH Road - Koyambedu Roundabout", "lat": 13.0694, "lng": 80.1948, "base_speed": 40},
    {"sensor_id": "S23", "edge_id": "edge-dev-23", "corridor_id": "POONAMALLEE_HIGH", "zone_id": "fog-gw-west", "intersection_name": "PH Road - Maduravoyal Flyover", "lat": 13.0640, "lng": 80.1650, "base_speed": 50},
    {"sensor_id": "S24", "edge_id": "edge-dev-24", "corridor_id": "POONAMALLEE_HIGH", "zone_id": "fog-gw-west", "intersection_name": "PH Road - Porur Link Junction", "lat": 13.0550, "lng": 80.1450, "base_speed": 55},

    # Inner Ring Road (3 sensors)
    {"sensor_id": "S25", "edge_id": "edge-dev-25", "corridor_id": "INNER_RING", "zone_id": "fog-gw-north", "intersection_name": "Inner Ring - Vadapalani Junction", "lat": 13.0500, "lng": 80.2120, "base_speed": 60},
    {"sensor_id": "S26", "edge_id": "edge-dev-26", "corridor_id": "INNER_RING", "zone_id": "fog-gw-north", "intersection_name": "Inner Ring - Ashok Pillar", "lat": 13.0340, "lng": 80.2110, "base_speed": 50},
    {"sensor_id": "S27", "edge_id": "edge-dev-27", "corridor_id": "INNER_RING", "zone_id": "fog-gw-north", "intersection_name": "Inner Ring - Kasi Theatre Bridge", "lat": 13.0240, "lng": 80.2070, "base_speed": 55},

    # Velachery Main Road (3 sensors)
    {"sensor_id": "S28", "edge_id": "edge-dev-28", "corridor_id": "VELACHERY_MAIN", "zone_id": "fog-gw-south", "intersection_name": "Velachery Rd - Guindy Race Course", "lat": 12.9980, "lng": 80.2180, "base_speed": 45},
    {"sensor_id": "S29", "edge_id": "edge-dev-29", "corridor_id": "VELACHERY_MAIN", "zone_id": "fog-gw-south", "intersection_name": "Velachery Rd - Dhandeeswaram Signal", "lat": 12.9780, "lng": 80.2210, "base_speed": 40},
    {"sensor_id": "S30", "edge_id": "edge-dev-30", "corridor_id": "VELACHERY_MAIN", "zone_id": "fog-gw-south", "intersection_name": "Velachery Rd - Vijayanagar Bus Stand", "lat": 12.9690, "lng": 80.2190, "base_speed": 45}
]

