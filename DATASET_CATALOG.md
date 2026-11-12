# FOG-IQ Dataset Catalog & Provenance Registry

## Overview
FOG-IQ strictly enforces data provenance, distinguishing between visual traffic layers (Google TrafficLayer), licensed external providers, public research datasets (METR-LA, PeMS), and calibrated software-defined sensor telemetry.

---

## 1. Registered Datasets

### A. Chennai Urban Arterial Corridor Benchmark (Calibrated v1.0.0)
- **Dataset ID**: `chennai_corridors_v1`
- **Location**: `data/synthetic/chennai_traffic_master_14d.parquet`
- **Format**: Apache Parquet (ZSTD compressed)
- **Record Count**: 120,960 observations
- **Temporal Resolution**: 5-minute sampling interval across 14 consecutive days
- **Spatial Coverage**: 30 virtual sensor nodes across 7 core arterial corridors:
  - Anna Salai (Mount Road)
  - Old Mahabalipuram Road (OMR / IT Expressway)
  - Grand Southern Trunk Road (GST Road)
  - Poonamallee High Road (EVR Periyar Salai)
  - Inner Ring Road (100 Feet Road)
  - Velachery Main Road
  - East Coast Road (ECR)
- **Features Captured**:
  - `speed_kmh`: Mean road segment speed (km/h)
  - `vehicle_count`: Flow throughput (vehicles per 5-min interval)
  - `density_vpm`: Estimated spatial density (vehicles per km)
  - `queue_length_m`: Physical queue accumulation at bottleneck intersections (meters)
  - `congestion_index`: Normalized congestion severity index (0.00 – 100.00)
  - `hour`, `day_of_week`, `is_weekend`: Temporal context
- **Provenance**: Calibrated using Highway Capacity Manual (HCM) arterial curves, Chennai intersection signal cycles, and Caltrans PeMS diurnal distribution.
- **License**: Creative Commons Attribution 4.0 International (CC-BY-4.0).

---

### B. METR-LA Reference Benchmark
- **Dataset ID**: `metr_la_reference`
- **Primary Source**: Caltrans Performance Measurement System (PeMS) / DCRNN (Li et al.)
- **Format**: Spatial-temporal graph (207 sensors, Los Angeles County)
- **Standard Use Case**: Cross-validation of graph-based and autoregressive forecasting baselines.

---

## 2. Data Provenance Policy
- **Visual Maps Separation**: Google Maps TrafficLayer is strictly rendered as an interactive visual layer for human dispatchers. Google Maps data is **never** scraped, exported, or used as machine learning training data.
- **Labeling Standard**: Every observation entering the FOG-IQ data lake is tagged with one of:
  - `GOOGLE_MAPS_VISUAL`
  - `GOOGLE_ROUTES_RESPONSE`
  - `PUBLIC_DATASET_CALIBRATED`
  - `VIRTUAL_SENSOR`
  - `EXTERNAL_LICENSED_PROVIDER`
  - `ML_PREDICTION`

