import importlib.util
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

from .adapters import ADAPTERS
from .models import SimulationRequest, SimulationResponse

service_root = Path(__file__).resolve().parents[1]
load_dotenv(service_root / ".env.local")
load_dotenv(service_root / ".env")

app = FastAPI(title="Quantum Learning Multi-Backend Simulator", version="1.0.0")


def backend_status():
    return [
        {"id": "qiskit-aer", "name": "Qiskit Aer", "local": True, "available": importlib.util.find_spec("qiskit_aer") is not None, "requiresKey": False},
        {"id": "pennylane", "name": "PennyLane default.qubit", "local": True, "available": importlib.util.find_spec("pennylane") is not None, "requiresKey": False},
        {"id": "cirq", "name": "Cirq Simulator", "local": True, "available": importlib.util.find_spec("cirq") is not None, "requiresKey": False},
        {"id": "qbraid-ionq", "name": "qBraid / IonQ Cloud", "local": False, "available": importlib.util.find_spec("qbraid") is not None and bool(os.getenv("IONQ_API_KEY")), "requiresKey": True},
    ]


@app.get("/health")
def health():
    return {"status": "ok", "backends": backend_status()}


@app.get("/backends")
def backends():
    return {"backends": backend_status()}


@app.post("/simulate", response_model=SimulationResponse)
def simulate(payload: SimulationRequest):
    try:
        return ADAPTERS[payload.backend](payload)
    except (ValueError, RuntimeError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ModuleNotFoundError as error:
        raise HTTPException(status_code=503, detail=f"Backend dependency is not installed: {error.name}") from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {error}") from error
