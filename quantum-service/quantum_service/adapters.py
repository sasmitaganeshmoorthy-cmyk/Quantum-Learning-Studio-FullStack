import os
import time
from collections import Counter

from .core import angle, normalized_operations, openqasm_for_cloud, probabilities_from_counts


def _result(backend, provider, counts, shots, started, local=True):
    normalized = {str(state): int(count) for state, count in counts.items() if int(count) > 0}
    return {
        "backend": backend,
        "provider": provider,
        "counts": normalized,
        "probabilities": probabilities_from_counts(normalized, shots),
        "shots": shots,
        "execution_time_ms": round((time.perf_counter() - started) * 1000, 3),
        "local": local,
    }


def run_qiskit(payload):
    started = time.perf_counter()
    from qiskit import QuantumCircuit, transpile
    from qiskit_aer import AerSimulator

    circuit = QuantumCircuit(payload.qubits, payload.qubits)
    for operation in normalized_operations(payload):
        gate = operation.gate.upper()
        qubits = operation.qubits
        if gate == "MEASURE":
            continue
        if gate == "CNOT": circuit.cx(*qubits)
        elif gate == "SWAP": circuit.swap(*qubits)
        elif gate in {"RX", "RY", "RZ", "P"}: getattr(circuit, gate.lower())(angle(operation), qubits[0])
        else: getattr(circuit, {"SDG": "sdg", "TDG": "tdg", "SX": "sx", "ID": "id"}.get(gate, gate.lower()))(qubits[0])
    circuit.measure(range(payload.qubits), range(payload.qubits))
    simulator = AerSimulator()
    compiled = transpile(circuit, simulator)
    raw_counts = simulator.run(compiled, shots=payload.shots, seed_simulator=42).result().get_counts()
    counts = {state.replace(" ", "")[::-1]: count for state, count in raw_counts.items()}
    return _result(payload.backend, "Qiskit AerSimulator", counts, payload.shots, started)


def run_pennylane(payload):
    started = time.perf_counter()
    import pennylane as qml

    device = qml.device("default.qubit", wires=payload.qubits, shots=payload.shots, seed=42)

    @qml.qnode(device)
    def circuit():
        for operation in normalized_operations(payload):
            gate = operation.gate.upper()
            qubits = operation.qubits
            if gate == "MEASURE": continue
            if gate == "H": qml.Hadamard(wires=qubits[0])
            elif gate == "X": qml.PauliX(wires=qubits[0])
            elif gate == "Y": qml.PauliY(wires=qubits[0])
            elif gate == "Z": qml.PauliZ(wires=qubits[0])
            elif gate == "S": qml.S(wires=qubits[0])
            elif gate == "T": qml.T(wires=qubits[0])
            elif gate == "SDG": qml.adjoint(qml.S)(wires=qubits[0])
            elif gate == "TDG": qml.adjoint(qml.T)(wires=qubits[0])
            elif gate == "SX": qml.SX(wires=qubits[0])
            elif gate == "ID": qml.Identity(wires=qubits[0])
            elif gate == "RX": qml.RX(angle(operation), wires=qubits[0])
            elif gate == "RY": qml.RY(angle(operation), wires=qubits[0])
            elif gate == "RZ": qml.RZ(angle(operation), wires=qubits[0])
            elif gate == "P": qml.PhaseShift(angle(operation), wires=qubits[0])
            elif gate == "CNOT": qml.CNOT(wires=qubits)
            elif gate == "SWAP": qml.SWAP(wires=qubits)
        return qml.counts(wires=range(payload.qubits))

    counts = circuit()
    return _result(payload.backend, "PennyLane default.qubit", counts, payload.shots, started)


def run_cirq(payload):
    started = time.perf_counter()
    import cirq

    qubits = cirq.LineQubit.range(payload.qubits)
    circuit = cirq.Circuit()
    single = {"H": cirq.H, "X": cirq.X, "Y": cirq.Y, "Z": cirq.Z, "S": cirq.S, "T": cirq.T, "SX": cirq.X ** 0.5, "ID": cirq.I}
    for operation in normalized_operations(payload):
        gate = operation.gate.upper()
        targets = [qubits[index] for index in operation.qubits]
        if gate == "MEASURE": continue
        if gate in single: circuit.append(single[gate](targets[0]))
        elif gate == "SDG": circuit.append((cirq.S ** -1)(targets[0]))
        elif gate == "TDG": circuit.append((cirq.T ** -1)(targets[0]))
        elif gate == "RX": circuit.append(cirq.rx(angle(operation))(targets[0]))
        elif gate == "RY": circuit.append(cirq.ry(angle(operation))(targets[0]))
        elif gate == "RZ": circuit.append(cirq.rz(angle(operation))(targets[0]))
        elif gate == "P": circuit.append(cirq.ZPowGate(exponent=angle(operation) / 3.141592653589793)(targets[0]))
        elif gate == "CNOT": circuit.append(cirq.CNOT(*targets))
        elif gate == "SWAP": circuit.append(cirq.SWAP(*targets))
    circuit.append(cirq.measure(*qubits, key="result"))
    result = cirq.Simulator(seed=42).run(circuit, repetitions=payload.shots)
    counts = Counter("".join(str(int(bit)) for bit in row) for row in result.measurements["result"])
    return _result(payload.backend, "Cirq Simulator", counts, payload.shots, started)


def run_qbraid(payload):
    started = time.perf_counter()
    api_key = os.getenv("IONQ_API_KEY")
    if not api_key:
        raise RuntimeError("qBraid IonQ Cloud requires IONQ_API_KEY. Use a free local backend when no cloud key is available.")
    from qbraid.runtime import IonQProvider

    provider = IonQProvider(api_key)
    device = provider.get_device(os.getenv("QBRAID_DEVICE_ID", "simulator"))
    result = device.run(openqasm_for_cloud(payload), shots=payload.shots).result()
    counts = result.data.get_counts()
    return _result(payload.backend, "qBraid Runtime / IonQ Cloud", counts, payload.shots, started, local=False)


ADAPTERS = {
    "qiskit-aer": run_qiskit,
    "pennylane": run_pennylane,
    "cirq": run_cirq,
    "qbraid-ionq": run_qbraid,
}
