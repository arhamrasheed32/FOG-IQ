<p align="center">
  <img src="assets/fog-iq-logo.jpg" alt="FOG-IQ Intelligent Traffic Platform" width="700" />
</p>

# FOG-IQ
### Intelligent Urban Traffic Operations, Real-Time Congestion Monitoring, Machine Learning Forecasting and Distributed Fog–Edge–Cloud Computing

Target Geography: **Greater Chennai, Tamil Nadu, India**

---

## 1. Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### Step 1: Install Python Dependencies & Train ML Models
```bash
# Install Python packages
pip install -r backend/requirements.txt

# Generate calibrated Chennai arterial benchmark dataset (120,960 observations)
python ml/datasets/dataset_downloader.py

# Train XGBoost multi-horizon forecasters & anomaly detectors
python ml/training/train_models.py
```

### Step 2: Install Frontend Dependencies & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Run the Application

#### Terminal 1 — Start FastAPI Backend (Port 8000)
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Documentation will be accessible at: `http://localhost:8000/docs`*
*WebSocket Stream: `ws://localhost:8000/ws/traffic`*

#### Terminal 2 — Start React Operations Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
*Open your browser at: `http://localhost:5173`*

---

## 2. Running Automated Tests
```bash
python -m pytest tests/ -v
```

---

## 3. Configuration & Optional Google Maps Key
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- **VITE_GOOGLE_MAPS_API_KEY**: Your Google Maps Browser API Key (with Maps JavaScript API enabled). If omitted, FOG-IQ automatically displays an interactive Chennai GIS Vector Canvas with complete node interactivity!
- **GOOGLE_MAPS_SERVER_API_KEY**: Your Google Maps Server Key (with Routes API enabled). If omitted, FOG-IQ uses its calibrated Chennai arterial routing engine with live congestion adjustment.
- **FOGIQ_AWS_ENABLED**: Set to `true` to activate AWS mode (S3, DynamoDB, SNS, IoT Core). By default, `LOCAL_MODE` runs 100% offline with zero cloud credentials required.

---

## 4. Key Architectural Highlights
- **11 Dedicated Operational Modules**: Command Center, Live Traffic Map, Route Intelligence, Corridor Monitoring, Traffic Forecasting, Edge Intelligence, Fog Network, ML Laboratory, Big Data Analytics, Alert Center, and System Observability.
- **Distributed Computing Hierarchy**:
  - **Edge Layer**: 30 virtual sensor nodes executing local anomaly scoring with offline ring buffers.
  - **Fog Layer**: 5 regional FastAPI gateways performing spatial aggregation and contiguous shockwave bottleneck detection.
  - **Cloud / Data Lake Layer**: Parquet analytical lake capturing partitioned historical observations.
- **Trained ML Models**: XGBoost multi-step horizon forecaster (+5m, +15m, +30m) achieving **R² = 0.9148** on chronological validation.
- **Interactive Fault Injection**: Operator modal to perturb corridors and intersections in real-time (bottleneck shock, vehicle collision, sensor disconnection).

