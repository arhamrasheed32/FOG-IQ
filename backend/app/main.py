"""
FOG-IQ Main Application Entrypoint
Intelligent Urban Traffic Operations, Real-Time Congestion Monitoring,
Machine Learning Forecasting and Distributed Fog-Edge-Cloud Computing.
"""

import os
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.api.v1.endpoints import (
    command_center,
    traffic,
    routes,
    forecasting,
    edge,
    fog,
    ml_lab,
    big_data,
    alerts,
    system,
    distributed,
    ws
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[*] FOG-IQ Backend starting up...")
    print("[*] Initializing Virtual IoT Simulator & Edge-Fog Pipeline...")
    yield
    print("[*] FOG-IQ Backend shutting down.")

app = FastAPI(
    title="FOG-IQ Backend API",
    description="Distributed Traffic Intelligence, Fog-Edge Computing and ML Operations for Chennai",
    version="1.4.0",
    lifespan=lifespan
)

# CORS & Private Network Access configuration
@app.middleware("http")
async def add_cors_and_pna_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
    else:
        response = await call_next(request)
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    if request.headers.get("access-control-request-private-network") == "true":
        response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(command_center.router, prefix="/api/v1/command-center", tags=["Command Center"])
app.include_router(traffic.router, prefix="/api/v1/traffic", tags=["Traffic & Simulator"])
app.include_router(routes.router, prefix="/api/v1/routes", tags=["Route Intelligence"])
app.include_router(forecasting.router, prefix="/api/v1/forecasting", tags=["ML Forecasting"])
app.include_router(edge.router, prefix="/api/v1/edge", tags=["Edge Computing"])
app.include_router(fog.router, prefix="/api/v1/fog", tags=["Fog Computing"])
app.include_router(ml_lab.router, prefix="/api/v1/ml", tags=["ML Laboratory"])
app.include_router(big_data.router, prefix="/api/v1/big-data", tags=["Big Data Lake"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alert Center"])
app.include_router(system.router, prefix="/api/v1/system", tags=["System Observability"])
app.include_router(distributed.router, prefix="/api/v1/distributed", tags=["Distributed Benchmarking"])
app.include_router(ws.router, tags=["WebSocket Live Telemetry"])

@app.get("/")
def root():
    return {
        "project": "FOG-IQ",
        "description": "Intelligent Urban Traffic Operations & Distributed Fog Intelligence",
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

