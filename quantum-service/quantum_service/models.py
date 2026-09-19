from typing import Literal

from pydantic import BaseModel, Field


class Operation(BaseModel):
    gate: str = Field(min_length=1, max_length=16)
    qubits: list[int]
    step: int = Field(default=0, ge=0)
    parameter: float | None = None


class SimulationRequest(BaseModel):
    backend: Literal["qiskit-aer", "pennylane", "cirq", "qbraid-ionq"]
    qubits: int = Field(ge=1, le=12)
    shots: int = Field(default=1024, ge=1, le=100_000)
    operations: list[Operation] = Field(default_factory=list, max_length=256)


class SimulationResponse(BaseModel):
    backend: str
    provider: str
    counts: dict[str, int]
    probabilities: dict[str, float]
    shots: int
    execution_time_ms: float
    local: bool
