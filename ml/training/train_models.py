"""
FOG-IQ Machine Learning Training & Evaluation Pipeline
Trains:
1. Multi-horizon Traffic Forecasters (5m, 15m, 30m) via XGBoost & Random Forest
2. Traffic Anomaly Detector via Isolation Forest
3. Congestion Level Classifier (Free Flow, Light, Moderate, Heavy, Severe)
4. Evaluates baselines (Persistence, Historical Mean)
5. Generates feature importance and persists models into ml/registry/
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.ensemble import RandomForestRegressor, IsolationForest, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, classification_report, confusion_matrix
import xgboost as xgb

def load_and_engineer_features(parquet_path="data/synthetic/chennai_traffic_master_14d.parquet"):
    print(f"[*] Loading dataset from {parquet_path}...")
    df = pd.read_parquet(parquet_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by=["sensor_id", "timestamp"]).reset_index(drop=True)

    # Feature Engineering per sensor time series
    dfs = []
    for sensor_id, group in df.groupby("sensor_id"):
        g = group.copy()
        # Lagged features
        g["lag_speed_1"] = g["speed_kmh"].shift(1)  # 5 min ago
        g["lag_speed_2"] = g["speed_kmh"].shift(2)  # 10 min ago
        g["lag_speed_3"] = g["speed_kmh"].shift(3)  # 15 min ago
        g["lag_speed_6"] = g["speed_kmh"].shift(6)  # 30 min ago

        g["lag_ci_1"] = g["congestion_index"].shift(1)
        g["lag_ci_2"] = g["congestion_index"].shift(2)
        g["lag_ci_3"] = g["congestion_index"].shift(3)

        # Rolling statistics (past 15 and 30 mins)
        g["rolling_speed_mean_3"] = g["lag_speed_1"].rolling(3).mean()
        g["rolling_speed_std_3"] = g["lag_speed_1"].rolling(3).std().fillna(0)
        g["rolling_queue_mean_3"] = g["queue_length_m"].shift(1).rolling(3).mean()

        # Targets for multi-step forecast
        g["target_ci_5m"] = g["congestion_index"].shift(-1)   # +5m
        g["target_ci_15m"] = g["congestion_index"].shift(-3)  # +15m
        g["target_ci_30m"] = g["congestion_index"].shift(-6)  # +30m

        g["target_speed_15m"] = g["speed_kmh"].shift(-3)      # +15m speed
        dfs.append(g)

    featured_df = pd.concat(dfs).dropna().reset_index(drop=True)

    # Encode categorical
    corridor_map = {corr: idx for idx, corr in enumerate(featured_df["corridor_id"].unique())}
    featured_df["corridor_encoded"] = featured_df["corridor_id"].map(corridor_map)

    # Sensor encoding
    sensor_map = {s: idx for idx, s in enumerate(featured_df["sensor_id"].unique())}
    featured_df["sensor_encoded"] = featured_df["sensor_id"].map(sensor_map)

    # Congestion category label:
    # 0: Free Flow (0-20), 1: Light (21-40), 2: Moderate (41-60), 3: Heavy (61-80), 4: Severe (81-100)
    bins = [-1, 20, 40, 60, 80, 101]
    labels = [0, 1, 2, 3, 4]
    featured_df["congestion_category"] = pd.cut(featured_df["congestion_index"], bins=bins, labels=labels).astype(int)

    return featured_df, corridor_map, sensor_map

def train_all_models():
    featured_df, corridor_map, sensor_map = load_and_engineer_features()

    feature_cols = [
        "corridor_encoded", "sensor_encoded", "hour", "day_of_week", "is_weekend",
        "lag_speed_1", "lag_speed_2", "lag_speed_3", "lag_speed_6",
        "lag_ci_1", "lag_ci_2", "lag_ci_3",
        "rolling_speed_mean_3", "rolling_speed_std_3", "rolling_queue_mean_3"
    ]

    # Chronological Split: 80% train, 20% test
    # (strictly chronological to prevent time-series lookahead bias)
    timestamps = featured_df["timestamp"].sort_values().unique()
    split_idx = int(len(timestamps) * 0.8)
    split_time = timestamps[split_idx]

    train_mask = featured_df["timestamp"] < split_time
    test_mask = featured_df["timestamp"] >= split_time

    X_train = featured_df.loc[train_mask, feature_cols]
    y_train_5m = featured_df.loc[train_mask, "target_ci_5m"]
    y_train_15m = featured_df.loc[train_mask, "target_ci_15m"]
    y_train_30m = featured_df.loc[train_mask, "target_ci_30m"]
    y_train_cat = featured_df.loc[train_mask, "congestion_category"]

    X_test = featured_df.loc[test_mask, feature_cols]
    y_test_5m = featured_df.loc[test_mask, "target_ci_5m"]
    y_test_15m = featured_df.loc[test_mask, "target_ci_15m"]
    y_test_30m = featured_df.loc[test_mask, "target_ci_30m"]
    y_test_cat = featured_df.loc[test_mask, "congestion_category"]

    print(f"[*] Train set size: {len(X_train)} | Test set size: {len(X_test)}")
    print(f"[*] Train cutoff: {split_time}")

    results = {
        "metadata": {
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "feature_names": feature_cols
        },
        "baselines": {},
        "models": {}
    }

    # 1. BASELINES
    # A. Persistence Baseline (Predict t using t-1)
    persistence_preds = featured_df.loc[test_mask, "lag_ci_1"]
    results["baselines"]["persistence"] = {
        "mae_15m": float(mean_absolute_error(y_test_15m, persistence_preds)),
        "rmse_15m": float(np.sqrt(mean_squared_error(y_test_15m, persistence_preds))),
        "r2_15m": float(r2_score(y_test_15m, persistence_preds))
    }

    # B. Historical Mean Baseline (grouped by sensor, hour, is_weekend)
    hist_means = featured_df[train_mask].groupby(["sensor_encoded", "hour", "is_weekend"])["congestion_index"].mean()
    test_keys = list(zip(X_test["sensor_encoded"], X_test["hour"], X_test["is_weekend"]))
    hist_preds = [hist_means.get(k, y_train_15m.mean()) for k in test_keys]
    results["baselines"]["historical_mean"] = {
        "mae_15m": float(mean_absolute_error(y_test_15m, hist_preds)),
        "rmse_15m": float(np.sqrt(mean_squared_error(y_test_15m, hist_preds))),
        "r2_15m": float(r2_score(y_test_15m, hist_preds))
    }

    # 2. MODEL 1: FORECASTING MODELS
    # Train 15m Forecaster with XGBoost
    print("[*] Training XGBoost 15m Forecaster...")
    t0 = time.time()
    xgb_15m = xgb.XGBRegressor(
        n_estimators=120,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        n_jobs=-1
    )
    xgb_15m.fit(X_train, y_train_15m)
    xgb_train_time = round(time.time() - t0, 3)

    t0 = time.time()
    preds_xgb_15m = xgb_15m.predict(X_test)
    xgb_infer_time = round((time.time() - t0) / len(X_test) * 1000, 4)

    results["models"]["xgboost_15m"] = {
        "mae": float(round(mean_absolute_error(y_test_15m, preds_xgb_15m), 3)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test_15m, preds_xgb_15m)), 3)),
        "r2": float(round(r2_score(y_test_15m, preds_xgb_15m), 4)),
        "train_time_sec": xgb_train_time,
        "inference_latency_ms": xgb_infer_time,
        "feature_importances": {col: float(round(imp, 4)) for col, imp in zip(feature_cols, xgb_15m.feature_importances_)}
    }

    # Train 5m and 30m XGBoost models
    print("[*] Training 5m and 30m XGBoost models...")
    xgb_5m = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1)
    xgb_5m.fit(X_train, y_train_5m)
    preds_5m = xgb_5m.predict(X_test)
    results["models"]["xgboost_5m"] = {
        "mae": float(round(mean_absolute_error(y_test_5m, preds_5m), 3)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test_5m, preds_5m)), 3)),
        "r2": float(round(r2_score(y_test_5m, preds_5m), 4))
    }

    xgb_30m = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42, n_jobs=-1)
    xgb_30m.fit(X_train, y_train_30m)
    preds_30m = xgb_30m.predict(X_test)
    results["models"]["xgboost_30m"] = {
        "mae": float(round(mean_absolute_error(y_test_30m, preds_30m), 3)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test_30m, preds_30m)), 3)),
        "r2": float(round(r2_score(y_test_30m, preds_30m), 4))
    }

    # Random Forest 15m (for model comparison)
    print("[*] Training Random Forest 15m benchmark...")
    rf_15m = RandomForestRegressor(n_estimators=60, max_depth=10, random_state=42, n_jobs=-1)
    rf_15m.fit(X_train.sample(n=min(30000, len(X_train)), random_state=42), y_train_15m.iloc[:min(30000, len(X_train))])
    preds_rf_15m = rf_15m.predict(X_test)
    results["models"]["random_forest_15m"] = {
        "mae": float(round(mean_absolute_error(y_test_15m, preds_rf_15m), 3)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test_15m, preds_rf_15m)), 3)),
        "r2": float(round(r2_score(y_test_15m, preds_rf_15m), 4))
    }

    # 3. MODEL 2: ANOMALY DETECTION (Isolation Forest)
    print("[*] Training Isolation Forest Anomaly Detector...")
    iso_features = ["lag_speed_1", "lag_ci_1", "rolling_speed_mean_3", "rolling_speed_std_3", "rolling_queue_mean_3"]
    iso_model = IsolationForest(contamination=0.04, random_state=42, n_jobs=-1)
    iso_model.fit(X_train[iso_features])
    results["models"]["isolation_forest"] = {
        "features": iso_features,
        "contamination": 0.04,
        "algorithm": "iForest (Liu et al.)"
    }

    # 4. MODEL 3: CONGESTION CLASSIFICATION (5 classes)
    print("[*] Training Congestion Classifier...")
    cls_model = RandomForestClassifier(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1)
    cls_model.fit(X_train.sample(n=min(25000, len(X_train)), random_state=42), y_train_cat.iloc[:min(25000, len(X_train))])
    preds_cls = cls_model.predict(X_test)
    cm = confusion_matrix(y_test_cat, preds_cls).tolist()
    rep = classification_report(y_test_cat, preds_cls, output_dict=True, zero_division=0)

    results["models"]["congestion_classifier"] = {
        "confusion_matrix": cm,
        "classes": ["Free Flow (0-20)", "Light (21-40)", "Moderate (41-60)", "Heavy (61-80)", "Severe (81-100)"],
        "accuracy": float(round(rep["accuracy"], 4)),
        "macro_f1": float(round(rep["macro avg"]["f1-score"], 4))
    }

    # Save models to registry
    os.makedirs("ml/registry", exist_ok=True)
    os.makedirs("ml/evaluation", exist_ok=True)

    joblib.dump(xgb_5m, "ml/registry/xgb_forecast_5m.joblib")
    joblib.dump(xgb_15m, "ml/registry/xgb_forecast_15m.joblib")
    joblib.dump(xgb_30m, "ml/registry/xgb_forecast_30m.joblib")
    joblib.dump(rf_15m, "ml/registry/rf_forecast_15m.joblib")
    joblib.dump(iso_model, "ml/registry/isolation_forest.joblib")
    joblib.dump(cls_model, "ml/registry/congestion_classifier.joblib")

    # Save metadata & encoders
    registry_meta = {
        "corridor_map": corridor_map,
        "sensor_map": sensor_map,
        "feature_cols": feature_cols,
        "iso_features": iso_features,
        "trained_date": datetime.utcnow().isoformat() + "Z",
        "model_version": "v1.4.0-chennai"
    }
    with open("ml/registry/models_metadata.json", "w") as f:
        json.dump(registry_meta, f, indent=2)

    with open("ml/evaluation/evaluation_metrics.json", "w") as f:
        json.dump(results, f, indent=2)

    print("[+] All models successfully trained and serialized to ml/registry!")
    print(f"[+] Evaluation results written to ml/evaluation/evaluation_metrics.json")
    print(f"    - XGBoost 15m R²: {results['models']['xgboost_15m']['r2']}, MAE: {results['models']['xgboost_15m']['mae']}")
    print(f"    - Random Forest 15m R²: {results['models']['random_forest_15m']['r2']}")
    print(f"    - Persistence Baseline MAE: {results['baselines']['persistence']['mae_15m']:.3f}")
    print(f"    - Classifier Accuracy: {results['models']['congestion_classifier']['accuracy'] * 100:.1f}%")

if __name__ == "__main__":
    train_all_models()

