import type { Circuit } from './types';

export type QuantumBackend =
  | 'qiskit-aer'
  | 'pennylane'
  | 'cirq'
  | 'qbraid-ionq';

export interface QuantumBackendStatus {
  available: boolean;
  provider?: string;
  local?: boolean;
  reason?: string;
}

export interface QuantumBackendsResponse {
  backends: Record<QuantumBackend, QuantumBackendStatus>;
}

export interface QuantumSimulationResult {
  backend: string;
  provider: string;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  shots: number;
  execution_time_ms: number;
  local: boolean;
}

function toSimulationOperations(circuit: Circuit) {
  return circuit.operations.map((operation) => ({
    gate: operation.gateType,
    qubits: operation.qubits,
    step: operation.step,
    parameter: operation.params?.theta,
  }));
}

export async function getQuantumBackends(): Promise<QuantumBackendsResponse> {
  const response = await fetch('/api/v1/quantum/backends', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Unable to load quantum backends.');
  }

  return data;
}

export async function simulateQuantumCircuit(input: {
  circuit: Circuit;
  backend: QuantumBackend;
  shots: number;
}): Promise<QuantumSimulationResult> {
  const response = await fetch('/api/v1/quantum/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      backend: input.backend,
      qubits: input.circuit.qubitCount,
      shots: input.shots,
      operations: toSimulationOperations(input.circuit),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? data.detail ?? 'Unable to simulate quantum circuit.');
  }

  return data;
}
