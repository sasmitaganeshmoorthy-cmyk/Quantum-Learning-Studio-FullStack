import {
  User,
  Course,
  Lesson,
  ConceptMastery,
  Circuit,
  CircuitValidationResult,
  SimulationResult,
  Challenge,
  ChallengeEvaluation,
  Project,
  Classroom,
  MisconceptionInsight,
  StateVectorEntry,
  GateExecutionStep
} from './types';

// Delay helper to mock network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- SEED DATA ---

export const mockUser: User = {
  id: 'usr-4819',
  email: 'learner@quantumstudio.edu',
  name: 'Alex Quantum',
  role: 'student',
  streak: 5,
  xp: 320,
  joinedAt: '2026-08-01T12:00:00Z',
  avatarUrl: ''
};

export const mockInstructor: User = {
  id: 'usr-1092',
  email: 'prof.einstein@quantumstudio.edu',
  name: 'Dr. Sarah Keller',
  role: 'instructor',
  streak: 0,
  xp: 1200,
  joinedAt: '2026-01-15T09:00:00Z',
  avatarUrl: ''
};

export const mockCourses: Course[] = [
  {
    id: 'course-101',
    title: 'Quantum Foundations & Superposition',
    description: 'Master the basic building blocks of quantum mechanics: qubits, state vectors, superposition, and basic gates (X, Y, Z, H).',
    difficulty: 'beginner',
    estimatedDuration: '2 hours',
    modulesCount: 2,
    lessonsCount: 6,
    progressPercent: 66,
    frameworks: ['Qiskit', 'OpenQASM'],
    outcomes: [
      'Explain the difference between a classical bit and a qubit',
      'Describe and visualize state vectors on a Bloch Sphere',
      'Use Hadamard (H) and Pauli-X gates to manipulate state vectors'
    ],
    prerequisites: ['Basic linear algebra (vectors and matrices)']
  },
  {
    id: 'course-102',
    title: 'Quantum Entanglement & Multi-Qubit Systems',
    description: 'Explore the strange phenomenon of quantum entanglement. Learn to construct Bell states, use CNOT, and analyze correlation.',
    difficulty: 'intermediate',
    estimatedDuration: '3 hours',
    modulesCount: 2,
    lessonsCount: 8,
    progressPercent: 25,
    frameworks: ['Qiskit', 'Cirq', 'PennyLane'],
    outcomes: [
      'Build Bell states and explain quantum correlation',
      'Use CNOT gates and understand control/target mechanics',
      'Distinguish between entangled states and separable states'
    ],
    prerequisites: ['Quantum Foundations & Superposition']
  },
  {
    id: 'course-201',
    title: 'Quantum Algorithms I: Deutsch-Jozsa & Grover',
    description: 'Unlock the real computational power of quantum computers. Implement Deutsch-Jozsa, phase kickback, and Grover search.',
    difficulty: 'advanced',
    estimatedDuration: '5 hours',
    modulesCount: 3,
    lessonsCount: 12,
    progressPercent: 0,
    frameworks: ['Qiskit', 'PennyLane'],
    outcomes: [
      'Explain phase kickback and apply it in algorithms',
      'Implement Deutsch-Jozsa and explain its exponential speedup',
      'Write Grover search circuits and explain amplitude amplification'
    ],
    prerequisites: ['Quantum Entanglement & Multi-Qubit Systems']
  }
];

export const mockConcepts: ConceptMastery[] = [
  {
    conceptId: 'qubit-state',
    name: 'Qubit State Representation',
    category: 'foundations',
    masteryPercent: 95,
    status: 'mastered',
    dependencies: []
  },
  {
    conceptId: 'superposition',
    name: 'Superposition & Hadamard Gate',
    category: 'foundations',
    masteryPercent: 80,
    status: 'mastered',
    dependencies: ['qubit-state']
  },
  {
    conceptId: 'entanglement',
    name: 'Entanglement & Bell States',
    category: 'algorithms',
    masteryPercent: 45,
    status: 'learning',
    dependencies: ['superposition'],
    recommendedNextActivity: {
      type: 'lesson',
      id: 'lesson-102-1',
      label: 'Lesson: Building Bell States'
    }
  },
  {
    conceptId: 'phase-kickback',
    name: 'Phase Kickback',
    category: 'algorithms',
    masteryPercent: 0,
    status: 'locked',
    dependencies: ['entanglement']
  },
  {
    conceptId: 'grover-search',
    name: 'Grover Search Algorithm',
    category: 'algorithms',
    masteryPercent: 0,
    status: 'locked',
    dependencies: ['phase-kickback']
  }
];

export const mockLessons: Record<string, Lesson> = {
  'lesson-101-1': {
    id: 'lesson-101-1',
    moduleId: 'mod-101-1',
    title: 'Qubits & The Bloch Sphere',
    description: 'Understand how a qubit represents state, and how it is visualized as a point on a sphere.',
    order: 1,
    isCompleted: true,
    xpReward: 30,
    blochSphereInitialState: { theta: 0, phi: 0 },
    contentMarkdown: `
# Qubits and the Bloch Sphere

In classical computing, the fundamental unit of information is a **bit**, which can be in a state of either $0$ or $1$. 

In quantum computing, we use a **qubit** (quantum bit). A qubit can exist in a state of $|0\\rangle$, $|1\\rangle$, or any **superposition** of both:

$$\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$

Here, $\\alpha$ and $\\beta$ are complex numbers representing probability amplitudes, and:

$$|\\alpha|^2 + |\\beta|^2 = 1$$

## Visualizing States: The Bloch Sphere
The **Bloch Sphere** is a geometrical representation of the pure state space of a two-level quantum mechanical system (a qubit). Any pure state $|\\psi\\rangle$ can be written as:

$$\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$

where $0 \\le \\theta \\le \\pi$ and $0 \\le \\phi < 2\\pi$.
* The north pole represents state $|0\\rangle$.
* The south pole represents state $|1\\rangle$.
* Points along the equator represent equal superpositions (e.g. $|+\\rangle$ and $|-\\rangle$).
    `,
    quizQuestions: [
      {
        id: 'q101-1',
        questionText: 'What does the North Pole of the Bloch Sphere represent?',
        options: ['State |1⟩', 'State |0⟩', 'An equal superposition (|+⟩)', 'A mixed state'],
        correctOptionIndex: 1,
        explanation: 'The North Pole represents the ground state |0⟩, which corresponds to theta = 0.'
      }
    ]
  },
  'lesson-102-1': {
    id: 'lesson-102-1',
    moduleId: 'mod-102-1',
    title: 'Building Bell States',
    description: 'Learn how to entangle two qubits to construct the famous Bell State, causing correlated measurement outcomes.',
    order: 1,
    isCompleted: false,
    xpReward: 50,
    blochSphereInitialState: { theta: 0, phi: 0 },
    contentMarkdown: `
# Quantum Entanglement & Bell States

Quantum entanglement is a physical phenomenon that occurs when a group of particles is generated, interact, or share spatial proximity in a way such that the quantum state of each particle cannot be described independently of the state of the others.

The simplest entangled state of two qubits is the **Bell State** (specifically, $|\\Phi^+\\rangle$):

$$|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}\\left(|00\\rangle + |11\\rangle\\right)$$

If you measure one qubit of a Bell state, it collapses to either $0$ or $1$ with a 50% probability. Critically, the other qubit will collapse to the **exact same** state instantly, regardless of distance!

## How to Build the Bell State Circuit
1. Initialize two qubits, $q_0$ and $q_1$, in state $|00\\rangle$.
2. Apply a **Hadamard (H)** gate to $q_0$ to put it in superposition:
   $$\\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)|0\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |10\\rangle)$$
3. Apply a **Controlled-NOT (CNOT)** gate, with $q_0$ as the control qubit and $q_1$ as the target qubit. 
   If $q_0$ is $|1\\rangle$, the CNOT flips $q_1$. This entangles them:
   $$\\text{CNOT} \\left[ \\frac{1}{\\sqrt{2}}(|00\\rangle + |10\\rangle) \\right] = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$
    `,
    circuitTemplate: {
      id: 'template-bell',
      name: 'Bell State Template',
      qubitCount: 2,
      stepCount: 4,
      operations: [],
      createdAt: '2026-08-28T10:00:00Z',
      updatedAt: '2026-08-28T10:00:00Z'
    },
    quizQuestions: [
      {
        id: 'q102-1',
        questionText: 'What gates are required to construct the Phi+ Bell State?',
        options: [
          'Pauli-X followed by Pauli-Z',
          'Hadamard (H) on q0, followed by a CNOT with control q0 and target q1',
          'Two Hadamard gates in parallel',
          'A Swap gate followed by a measurement'
        ],
        correctOptionIndex: 1,
        explanation: 'Applying H on q0 creates superposition, and the CNOT entangles it with q1.'
      }
    ]
  }
};

export const mockChallenges: Challenge[] = [
  {
    id: 'challenge-bell-fix',
    title: 'The Entanglement Glitch',
    description: 'A student is trying to create the Bell state |Φ⁺⟩ = 1/√2(|00⟩ + |11⟩) but something is wrong. The qubits do not seem entangled. Find and fix the issue.',
    difficulty: 'easy',
    requiredConcepts: ['superposition', 'entanglement'],
    estimatedTimeMinutes: 10,
    xpReward: 100,
    startingCircuit: {
      id: 'circuit-challenge-1',
      name: 'Buggy Bell State',
      qubitCount: 2,
      stepCount: 4,
      operations: [
        { id: 'op1', gateType: 'H', qubits: [0], step: 0 },
        { id: 'op2', gateType: 'MEASURE', qubits: [0], step: 1 }, // BUG: Measuring before CNOT collapses state!
        { id: 'op3', gateType: 'CNOT', qubits: [0, 1], step: 2 }
      ],
      createdAt: '2026-08-28T10:00:00Z',
      updatedAt: '2026-08-28T10:00:00Z'
    },
    validationCriteria: 'The final simulated probabilities must show exactly 50% for "00" and 50% for "11", and 0% for "01" or "10".',
    hints: [
      'Look at the order of gates. Are we measuring the state before the entanglement occurs?',
      'Remember, measuring collapses the quantum state. A CNOT applied after a measurement operates on a classical state.'
    ]
  }
];

export const mockClassrooms: Classroom[] = [
  {
    id: 'class-801',
    name: 'Intro to Quantum Systems - Fall 2026',
    instructorName: 'Dr. Sarah Keller',
    studentCount: 24,
    averageMastery: 72,
    inviteCode: 'QSTUDIO801',
    createdAt: '2026-08-01T09:00:00Z'
  }
];

export const mockMisconceptions: MisconceptionInsight[] = [
  {
    id: 'misc-001',
    classroomId: 'class-801',
    conceptId: 'entanglement',
    conceptName: 'Early Measurement before Entanglement',
    percentageAffected: 62,
    description: 'Many students place a Measurement gate on the control qubit before applying the CNOT entangling gate, collapsing the superposition state to classical values and preventing quantum correlation.',
    exampleErrorSnippet: `q_0: ── H ── 🎛️ ── Control ──
q_1: ───────────── Target ──`,
    remedyAction: 'Recommend students complete the "Why Mode" tutorial showing the difference in step-by-step probabilities when measurement occurs before vs. after CNOT.',
    affectedStudentIds: ['stu-001', 'stu-004', 'stu-009', 'stu-015']
  },
  {
    id: 'misc-002',
    classroomId: 'class-801',
    conceptId: 'superposition',
    conceptName: 'Hadamard-Hadamard Cancellation',
    percentageAffected: 28,
    description: 'Students apply two consecutive Hadamard gates expecting deeper superposition, not realizing that H is its own inverse (H * H = I) and returns the qubit to its initial classical state.',
    exampleErrorSnippet: `q_0: ── H ── H ──`,
    remedyAction: 'Direct students to the Bloch Sphere visualizer to see how the first H rotates to the X-axis, and the second H rotates it back to Z-axis |0⟩.',
    affectedStudentIds: ['stu-003', 'stu-012', 'stu-019']
  }
];

// --- CORE SERVICE FUNCTIONS ---

export const mockApi = {
  // Authentication
  login: async (email: string): Promise<User> => {
    await delay(600);
    if (email.includes('instructor')) return mockInstructor;
    return mockUser;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    await delay(300);
    return [
      {
        id: 'proj-1',
        name: 'My Bell State Experiment',
        description: 'Testing ideal correlations and converting to PennyLane.',
        circuit: {
          id: 'circuit-p1',
          name: 'My Bell State Experiment',
          qubitCount: 2,
          stepCount: 4,
          operations: [
            { id: '1', gateType: 'H', qubits: [0], step: 0 },
            { id: '2', gateType: 'CNOT', qubits: [0, 1], step: 1 },
            { id: '3', gateType: 'MEASURE', qubits: [0], step: 2 },
            { id: '4', gateType: 'MEASURE', qubits: [1], step: 3 }
          ],
          createdAt: '2026-08-28T10:00:00Z',
          updatedAt: '2026-08-28T10:00:00Z'
        },
        framework: 'qiskit',
        backend: 'ideal_simulator',
        shots: 1024,
        collaborators: [{ name: 'Alex Quantum' }],
        lastModified: '2026-08-28T14:00:00Z',
        versionCount: 3
      }
    ];
  },

  // Deterministic Circuit Validation
  validateCircuit: async (circuit: Circuit): Promise<CircuitValidationResult> => {
    await delay(200);
    const errors: CircuitValidationResult['errors'] = [];

    // Check 1: Early measurement before control gate
    const measurements = circuit.operations.filter((op) => op.gateType === 'MEASURE');
    const cnots = circuit.operations.filter((op) => op.gateType === 'CNOT');

    for (const meas of measurements) {
      for (const cnot of cnots) {
        // CNOT qubit[0] is control, qubit[1] is target
        if (cnot.qubits[0] === meas.qubits[0] && cnot.step > meas.step) {
          errors.push({
            id: `err-early-${meas.id}`,
            title: 'Misconception: Early Measurement',
            message: `Qubit ${meas.qubits[0]} is measured at step ${meas.step} before being used as a control qubit in a CNOT at step ${cnot.step}.`,
            severity: 'error',
            qubitIndices: [meas.qubits[0]],
            stepIndex: meas.step,
            remedyAction: 'Move the measurement gate to a step after the CNOT gate.',
            explanation: 'Measuring a qubit collapses its state vector immediately to a classical 0 or 1. If you use it as a control afterward, you lose all quantum superposition/entanglement benefits, operating classically instead.'
          });
        }
      }
    }

    // Check 2: Double H cancelation
    for (let q = 0; q < circuit.qubitCount; q++) {
      const qOps = circuit.operations
        .filter((op) => op.qubits.includes(q))
        .sort((a, b) => a.step - b.step);
      
      for (let i = 0; i < qOps.length - 1; i++) {
        if (qOps[i].gateType === 'H' && qOps[i+1].gateType === 'H' && qOps[i+1].step === qOps[i].step + 1) {
          errors.push({
            id: `err-cancel-${qOps[i].id}`,
            title: 'Hadamard Cancellation',
            message: `Consecutive Hadamard (H) gates on Qubit ${q} at steps ${qOps[i].step} and ${qOps[i+1].step} cancel each other out.`,
            severity: 'warning',
            qubitIndices: [q],
            stepIndex: qOps[i+1].step,
            remedyAction: 'Remove the consecutive H gates if you intended to maintain superposition.',
            explanation: 'The Hadamard gate is self-inverse. Applying H twice successively rotates the qubit state to the X-axis and then directly back to the original Z-axis state (|0⟩ or |1⟩).'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Framework Conversion
  convertCircuitToCode: (circuit: Circuit, framework: 'qiskit' | 'cirq' | 'pennylane' | 'openqasm'): string => {
    const qiskitOps: string[] = [];
    const cirqOps: string[] = [];
    const pennyOps: string[] = [];
    const qasmOps: string[] = [];

    // Sort operations by step
    const sortedOps = [...circuit.operations].sort((a, b) => a.step - b.step);

    sortedOps.forEach((op) => {
      if (op.gateType === 'H') {
        qiskitOps.push(`qc.h(${op.qubits[0]})`);
        cirqOps.push(`cirq.H(qubits[${op.qubits[0]}])`);
        pennyOps.push(`qml.Hadamard(wires=${op.qubits[0]})`);
        qasmOps.push(`h q[${op.qubits[0]}];`);
      } else if (op.gateType === 'X') {
        qiskitOps.push(`qc.x(${op.qubits[0]})`);
        cirqOps.push(`cirq.X(qubits[${op.qubits[0]}])`);
        pennyOps.push(`qml.PauliX(wires=${op.qubits[0]})`);
        qasmOps.push(`x q[${op.qubits[0]}];`);
      } else if (op.gateType === 'Y') {
        qiskitOps.push(`qc.y(${op.qubits[0]})`);
        cirqOps.push(`cirq.Y(qubits[${op.qubits[0]}])`);
        pennyOps.push(`qml.PauliY(wires=${op.qubits[0]})`);
        qasmOps.push(`y q[${op.qubits[0]}];`);
      } else if (op.gateType === 'Z') {
        qiskitOps.push(`qc.z(${op.qubits[0]})`);
        cirqOps.push(`cirq.Z(qubits[${op.qubits[0]}])`);
        pennyOps.push(`qml.PauliZ(wires=${op.qubits[0]})`);
        qasmOps.push(`z q[${op.qubits[0]}];`);
      } else if (op.gateType === 'CNOT') {
        qiskitOps.push(`qc.cx(${op.qubits[0]}, ${op.qubits[1]})`);
        cirqOps.push(`cirq.CNOT(qubits[${op.qubits[0]}], qubits[${op.qubits[1]}])`);
        pennyOps.push(`qml.CNOT(wires=[${op.qubits[0]}, ${op.qubits[1]}])`);
        qasmOps.push(`cx q[${op.qubits[0]}], q[${op.qubits[1]}];`);
      } else if (op.gateType === 'MEASURE') {
        qiskitOps.push(`qc.measure(${op.qubits[0]}, ${op.qubits[0]})`);
        cirqOps.push(`cirq.measure(qubits[${op.qubits[0]}], key='m${op.qubits[0]}')`);
        pennyOps.push(`qml.measure(${op.qubits[0]})`);
        qasmOps.push(`measure q[${op.qubits[0]}] -> c[${op.qubits[0]}];`);
      }
    });

    switch (framework) {
      case 'qiskit':
        return `# Qiskit Code for ${circuit.name || 'Quantum Circuit'}
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

qc = QuantumCircuit(${circuit.qubitCount}, ${circuit.qubitCount})
${qiskitOps.map((op) => op).join('\n')}

# Execute simulation
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1024)
result = job.result()
counts = result.get_counts(qc)
print("Counts:", counts)
`;
      case 'cirq':
        return `# Google Cirq Code
import cirq

qubits = cirq.LineQubit.range(${circuit.qubitCount})
circuit = cirq.Circuit()

circuit.append([
    ${cirqOps.map((op) => op).join(',\n    ')}
])

simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1024)
print(result)
`;
      case 'pennylane':
        return `# Xanadu PennyLane Code
import pennylane as qml

dev = qml.device("default.qubit", wires=${circuit.qubitCount})

@qml.qnode(dev)
def quantum_circuit():
    ${pennyOps.map((op) => op).join('\n    ')}
    return [qml.probs(wires=i) for i in range(${circuit.qubitCount})]

print(quantum_circuit())
`;
      case 'openqasm':
        return `// OpenQASM 2.0 Representing Circuit
OPENQASM 2.0;
include "qelib1.inc";

qreg q[${circuit.qubitCount}];
creg c[${circuit.qubitCount}];

${qasmOps.map((op) => op).join('\n')}
`;
    }
  },

  // Dynamic Step-by-Step Simulation (for Why Mode and visual output)
  simulateCircuit: async (circuit: Circuit, backend: string, shots: number): Promise<SimulationResult> => {
    await delay(800);

    const validation = await mockApi.validateCircuit(circuit);
    const hasEarlyMeasurement = validation.errors.some(e => e.id.includes('early'));

    const qubitCount = circuit.qubitCount;
    const executionSteps: GateExecutionStep[] = [];

    // Helper to calculate state vector sizes
    const numStates = Math.pow(2, qubitCount);
    
    // We start at Step 0: |00...0>
    let currentState: StateVectorEntry[] = Array.from({ length: numStates }, (_, idx) => {
      const binary = idx.toString(2).padStart(qubitCount, '0');
      return {
        state: `|${binary}>`,
        amplitudeReal: idx === 0 ? 1 : 0,
        amplitudeImag: 0,
        probability: idx === 0 ? 1.0 : 0
      };
    });

    const initialBloch: Record<number, { x: number; y: number; z: number }> = {};
    for (let i = 0; i < qubitCount; i++) {
      initialBloch[i] = { x: 0, y: 0, z: 1.0 }; // pointing straight up at |0>
    }

    executionSteps.push({
      stepIndex: 0,
      stateVector: JSON.parse(JSON.stringify(currentState)),
      blochState: JSON.parse(JSON.stringify(initialBloch)),
      probabilities: { [Array(qubitCount).fill('0').join('')]: 1.0 },
      explanation: 'Circuit is initialized. All qubits are in state |0⟩.'
    });

    // We simulate step-by-step
    for (let step = 0; step < circuit.stepCount; step++) {
      const stepOps = circuit.operations.filter((op) => op.step === step);
      
      // Compute updated state based on operations
      // For simplicity, we model the standard Bell State, Superposition, and simple modifications
      if (stepOps.length > 0) {
        const op = stepOps[0]; // Assume one major gate for debug
        
        let expl = `Applying ${op.gateType} gate on qubit ${op.qubits.join(', ')}.`;
        const nextBloch = JSON.parse(JSON.stringify(executionSteps[executionSteps.length - 1].blochState));
        const prevProbs = executionSteps[executionSteps.length - 1].probabilities;
        const nextProbs: Record<string, number> = {};

        if (op.gateType === 'H') {
          const targetQ = op.qubits[0];
          nextBloch[targetQ] = { x: 1.0, y: 0, z: 0 }; // Rotates to superposition X axis
          expl = `Hadamard (H) gate puts Qubit ${targetQ} into a 50/50 superposition of |0⟩ and |1⟩. The vector rotates from Z-axis to X-axis on the Bloch Sphere.`;
          
          if (qubitCount === 1) {
            currentState = [
              { state: '|0>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 },
              { state: '|1>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 }
            ];
            nextProbs['0'] = 0.5;
            nextProbs['1'] = 0.5;
          } else if (qubitCount === 2) {
            // If starting from |00>, H on q0 makes: 1/sqrt(2)(|00> + |10>)
            currentState = [
              { state: '|00>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 },
              { state: '|01>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 },
              { state: '|10>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 },
              { state: '|11>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 }
            ];
            nextProbs['00'] = 0.5;
            nextProbs['10'] = 0.5;
          }
        } 
        else if (op.gateType === 'CNOT') {
          const ctrl = op.qubits[0];
          const tgt = op.qubits[1];
          expl = `Controlled-NOT (CNOT) target flips Qubit ${tgt} conditional on Qubit ${ctrl} being |1⟩. Since Qubit ${ctrl} is in superposition, this entangles them.`;
          
          if (qubitCount === 2) {
            if (hasEarlyMeasurement) {
              // Early measurement collapsed it, so CNOT acts on classical states.
              // Let's assume q0 collapsed to 1 (50%) or 0 (50%). State vector is mixed.
              currentState = [
                { state: '|00>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 },
                { state: '|01>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 },
                { state: '|10>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 },
                { state: '|11>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 }
              ];
              nextProbs['00'] = 0.5;
              nextProbs['11'] = 0.5;
              nextBloch[tgt] = { x: 0, y: 0, z: -1.0 }; // collapsed
            } else {
              // Normal CNOT turns 1/sqrt(2)(|00> + |10>) into 1/sqrt(2)(|00> + |11>)
              currentState = [
                { state: '|00>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 },
                { state: '|01>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 },
                { state: '|10>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 },
                { state: '|11>', amplitudeReal: Math.SQRT1_2, amplitudeImag: 0, probability: 0.5 }
              ];
              nextProbs['00'] = 0.5;
              nextProbs['11'] = 0.5;
              nextBloch[tgt] = { x: 0, y: 0, z: 0 }; // Qubit 1 is now fully entangled (cannot be plotted alone, coordinates shrink to origin)
            }
          }
        } 
        else if (op.gateType === 'MEASURE') {
          const targetQ = op.qubits[0];
          nextBloch[targetQ] = { x: 0, y: 0, z: Math.random() > 0.5 ? 1.0 : -1.0 }; // collapses state to north/south pole
          expl = `Measurement gate collapses Qubit ${targetQ}'s wave function to a classical state vector. Bloch sphere vector collapses to one of the poles.`;
          
          // Carry over probabilities
          Object.assign(nextProbs, prevProbs);
        }
        else {
          // Fallback simple gate logic (X gate)
          const targetQ = op.qubits[0];
          if (op.gateType === 'X') {
            nextBloch[targetQ] = { x: 0, y: 0, z: -1.0 }; // inverted
            expl = `Pauli-X (NOT) gate flips the state of Qubit ${targetQ}. Rotates state 180 degrees around the X-axis.`;
            
            if (qubitCount === 1) {
              currentState = [
                { state: '|0>', amplitudeReal: 0, amplitudeImag: 0, probability: 0 },
                { state: '|1>', amplitudeReal: 1.0, amplitudeImag: 0, probability: 1.0 }
              ];
              nextProbs['1'] = 1.0;
            }
          }
        }

        executionSteps.push({
          stepIndex: step + 1,
          activeOperation: op,
          stateVector: JSON.parse(JSON.stringify(currentState)),
          blochState: nextBloch,
          probabilities: Object.keys(nextProbs).length > 0 ? nextProbs : prevProbs,
          explanation: expl
        });
      }
    }

    // Final outcome counts based on final step probabilities
    const finalStep = executionSteps[executionSteps.length - 1];
    const finalProbs = finalStep.probabilities;
    const counts: Record<string, number> = {};
    
    Object.entries(finalProbs).forEach(([state, prob]) => {
      // Scale count to shots
      counts[state] = Math.round(prob * shots);
    });

    return {
      jobId: `sim-job-${Math.floor(Math.random() * 9000 + 1000)}`,
      counts,
      probabilities: finalProbs,
      stateVector: finalStep.stateVector,
      executionSteps,
      quantumVolumeCost: 16
    };
  },

  // Challenge Submissions
  evaluateChallenge: async (challengeId: string, circuit: Circuit): Promise<ChallengeEvaluation> => {
    await delay(1200);

    if (challengeId === 'challenge-bell-fix') {
      const validation = await mockApi.validateCircuit(circuit);
      const isIncorrect = validation.errors.some(e => e.id.includes('early'));
      
      const containsH = circuit.operations.some(op => op.gateType === 'H' && op.qubits[0] === 0);
      const containsCNOT = circuit.operations.some(op => op.gateType === 'CNOT' && op.qubits[0] === 0 && op.qubits[1] === 1);

      if (isIncorrect) {
        return {
          isCorrect: false,
          feedback: 'Validation Failed: Your circuit still measures the qubit before the Controlled-NOT (CNOT) operation is completed. This collapses the state early!',
          misconceptionDetected: 'Early Measurement before Entanglement'
        };
      }

      if (containsH && containsCNOT && circuit.operations.filter(op => op.gateType === 'MEASURE').length >= 2) {
        return {
          isCorrect: true,
          feedback: 'Outstanding! You correctly removed the early measurement step. The circuit now establishes ideal superposition and successfully entangles the qubits, producing correlated measurement outcomes.'
        };
      }
    }

    return {
      isCorrect: false,
      feedback: 'The circuit operations do not match the expected state vector criteria. Review the required target state probabilities.'
    };
  },

  // AI Tutor Streaming Response Generator
  askAiTutor: async (
    prompt: string, 
    context: { type: string; id?: string; state?: unknown },
    onChunk: (chunk: string) => void
  ): Promise<string> => {
    let text = `Hello! I am your Quantum Learning Assistant. `;

    if (prompt.toLowerCase().includes('explain this gate') || prompt.toLowerCase().includes('hadamard')) {
      text += `The Hadamard (H) gate is a single-qubit operation that maps the basis state |0⟩ to |+⟩ = 1/√2(|0⟩ + |1⟩) and |1⟩ to |-⟩ = 1/√2(|0⟩ - |1⟩). 

Mathematically, it is represented by the matrix:
$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$

On the Bloch sphere, it represents a 180-degree rotation around the X+Z axis, transitioning Z-basis states into X-basis states. Do you want to see what happens when we chain two Hadamard gates together?`;
    } else if (prompt.toLowerCase().includes('mistake') || prompt.toLowerCase().includes('debug')) {
      text += `I've analyzed your circuit. I spotted an issue: you are measuring Qubit 0 at Step 1, but then utilizing Qubit 0 as the control wire in a Controlled-NOT (CNOT) gate at Step 2.

**Why this is a conceptual mistake:**
In quantum mechanics, measurement is a destructive action. It forces a qubit in superposition to collapse into a classical state (|0⟩ or |1⟩). If you apply a control operation after measurement, you are just building a classical conditionally-triggered circuit, not a quantum entangled one!

**How to resolve it:**
Remove the Measurement operation at Step 1, and place it at the very end of your circuit (after the CNOT). This keeps the superposition alive for the entangling stage.`;
    } else if (prompt.toLowerCase().includes('entanglement')) {
      text += `Quantum entanglement is a state where the description of two qubits is linked. 

For the Bell state $|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$, measuring the first qubit gives |0⟩ or |1⟩ with equal probability, but the second qubit instantly collapses to the same value! 

Try building this in the Quantum Lab. Place a Hadamard on Qubit 0, then a CNOT from Qubit 0 to Qubit 1.`;
    } else {
      text += `I see you are working on the lesson: "${context.type === 'lesson' ? context.id : 'Quantum Computing Basics'}". 

In quantum mechanics, everything is about states, rotations, and amplitudes. Keep in mind:
1. Qubits are represented as vectors.
2. Gates are matrices representing rotations.
3. Measurement is a projection that collapses the state.

What specific concept or gate formula can I clarify for you today?`;
    }

    // Simulate streaming delivery
    const words = text.split(' ');
    let current = '';
    for (const word of words) {
      current += word + ' ';
      onChunk(current);
      await delay(40);
    }

    return text;
  }
};

