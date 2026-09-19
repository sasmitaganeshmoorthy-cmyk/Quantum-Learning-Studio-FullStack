import math

SUPPORTED_GATES = {
    "H", "X", "Y", "Z", "S", "T", "SDG", "TDG", "SX", "ID",
    "RX", "RY", "RZ", "P", "CNOT", "SWAP", "MEASURE",
}


def normalized_operations(payload):
    qubit_count = payload.qubits
    operations = sorted(payload.operations, key=lambda operation: operation.step)
    for operation in operations:
        gate = operation.gate.upper()
        if gate not in SUPPORTED_GATES:
            raise ValueError(f"Unsupported gate: {gate}")
        expected = 2 if gate in {"CNOT", "SWAP"} else 1
        if len(operation.qubits) != expected:
            raise ValueError(f"{gate} requires {expected} qubit(s)")
        if any(qubit < 0 or qubit >= qubit_count for qubit in operation.qubits):
            raise ValueError(f"{gate} references a qubit outside the circuit")
        if len(set(operation.qubits)) != len(operation.qubits):
            raise ValueError(f"{gate} requires distinct qubits")
    return operations


def angle(operation):
    return operation.parameter if operation.parameter is not None else math.pi / 2


def openqasm_for_cloud(payload):
    lines = ["OPENQASM 3.0;", 'include "stdgates.inc";', f"qubit[{payload.qubits}] q;"]
    names = {"CNOT": "cx", "SDG": "sdg", "TDG": "tdg", "SX": "sx", "ID": "id"}
    for operation in normalized_operations(payload):
        gate = operation.gate.upper()
        if gate == "MEASURE":
            continue
        name = names.get(gate, gate.lower())
        if gate in {"CNOT", "SWAP"}:
            lines.append(f"{name} q[{operation.qubits[0]}], q[{operation.qubits[1]}];")
        elif gate in {"RX", "RY", "RZ", "P"}:
            lines.append(f"{name}({angle(operation)}) q[{operation.qubits[0]}];")
        else:
            lines.append(f"{name} q[{operation.qubits[0]}];")
    return "\n".join(lines)


def probabilities_from_counts(counts, shots):
    return {state: count / shots for state, count in counts.items()}
