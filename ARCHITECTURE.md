# FOG-IQ Architecture Documentation

## 1. System Topology Overview
FOG-IQ is an intelligent urban traffic operations and mobility analytics platform targeting Greater Chennai, Tamil Nadu, India.
The system implements a three-tier distributed computing hierarchy: **Edge Layer → Fog Layer → Cloud / Data Lake Layer**.

```
[30 Chennai Virtual IoT Sensors]
       │
       ▼
[Edge Micro-Inference Layer (Greengrass V2 / Python)]
       │ (Filtered local anomalies, edge latency ~1.2ms)
       ▼
[5 Regional Fog Gateways (FastAPI)]
       │ (Spatial aggregation, contiguous shockwave detection ~14.8ms)
       ▼
┌─────────────────────────────────┬─────────────────────────────────┐
│ LOCAL MODE                      │ AWS MODE                        │
│ - Parquet Telemetry Lake        │ - AWS IoT Core / MQTT           │
│ - Local State Store             │ - AWS Kinesis Streaming         │
│ - FastAPI WebSocket Broadcaster │ - Amazon S3 Data Lake (Parquet) │
│                                 │ - Amazon DynamoDB & Amazon SNS  │
└─────────────────────────────────┴─────────────────────────────────┘
                                  │
                                  ▼
                    [React Glassmorphism Operations UI]
                    - Google Maps Platform + TrafficLayer
                    - 11 Specialized Operational Modules
                    - Sub-second Live Telemetry Sync
```

---

## 2. Distributed Computing Strategy Comparison

| Metric | Edge-Only Execution | Fog-Assisted (FOG-IQ) | Centralized Cloud |
| :--- | :--- | :--- | :--- |
| **Processing Latency** | 1.25 ms | 14.8 ms | 84.5 ms |
| **Network Messages / Min** | 180 | 900 | 3,600 |
| **Bandwidth Consumed** | 4.8 KB/s | 28.5 KB/s | 142.0 KB/s |
| **Bandwidth Savings vs Cloud** | 96.6% | **79.9%** | 0.0% |
| **Spatial Anomaly Correlation** | No (Isolated) | **Yes (Corridor Shockwaves)** | Yes (Delayed) |
| **Offline Fault Tolerance** | 100% Local Ring Buffer | **100% Zone Buffer** | 0% (Drops Packets) |

---

## 3. Data Provenance & Strict Boundaries
FOG-IQ strictly enforces separation between visual map presentation and analytical datasets:
1. **Google Maps TrafficLayer**: Rendered exclusively in the browser for operator visual context. Never scraped, exported, or used as machine learning training data.
2. **Google Routes API**: Invoked server-side with `TRAFFIC_AWARE_OPTIMAL` for live itinerary calculations. Tagged as `GOOGLE_ROUTES_RESPONSE`.
3. **Calibrated Arterial Benchmark**: 120,960 5-minute interval observations across 30 Chennai intersections calibrated against Highway Capacity Manual (HCM) curves. Tagged as `PUBLIC_DATASET_CALIBRATED`.
4. **Virtual IoT Sensor Telemetry**: Software-defined traffic sensors generating real-time velocity, density, and queue telemetry. Tagged as `VIRTUAL_SENSOR`.
5. **Machine Learning Forecasts**: Multi-horizon predictions generated via trained XGBoost models. Tagged as `ML_PREDICTION`.

---

## 4. Machine Learning Architecture
- **Model 1: XGBoost Multi-Horizon Regressor**:
  - Predicts congestion index (0–100) and velocity at +5m, +15m, and +30m horizons.
  - Chronological validation: **R² = 0.9148, MAE = 5.815** (outperforming persistence baseline MAE: 8.806).
- **Model 2: Isolation Forest Anomaly Detector**:
  - Evaluates multivariate drift (speed collapse, sudden density spike, abnormal queue).
- **Model 3: Congestion Category Classifier**:
  - Classifies flow into Free Flow, Light, Moderate, Heavy, and Severe.

