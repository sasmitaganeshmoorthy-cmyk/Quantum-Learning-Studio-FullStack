import unittest
from types import SimpleNamespace

from quantum_service.core import normalized_operations, openqasm_for_cloud, probabilities_from_counts


class CoreTests(unittest.TestCase):
    def payload(self):
        return SimpleNamespace(
            qubits=2,
            operations=[
                SimpleNamespace(gate="H", qubits=[0], step=0, parameter=None),
                SimpleNamespace(gate="CNOT", qubits=[0, 1], step=1, parameter=None),
            ],
        )

    def test_validates_and_orders_operations(self):
        self.assertEqual([item.gate for item in normalized_operations(self.payload())], ["H", "CNOT"])

    def test_generates_openqasm_for_qbraid(self):
        qasm = openqasm_for_cloud(self.payload())
        self.assertIn("OPENQASM 3.0;", qasm)
        self.assertIn("h q[0];", qasm)
        self.assertIn("cx q[0], q[1];", qasm)

    def test_probabilities(self):
        self.assertEqual(probabilities_from_counts({"00": 50, "11": 50}, 100), {"00": 0.5, "11": 0.5})


if __name__ == "__main__":
    unittest.main()
