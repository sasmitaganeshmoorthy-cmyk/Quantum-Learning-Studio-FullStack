import type { Circuit } from '@/lib/api/types';

const EPSILON = 1e-12;

interface Complex {
  re: number;
  im: number;
}

type Matrix2 = [[Complex, Complex], [Complex, Complex]];

const complex = (re = 0, im = 0): Complex => ({ re, im });

const add = (a: Complex, b: Complex): Complex =>
  complex(a.re + b.re, a.im + b.im);

const multiply = (a: Complex, b: Complex): Complex =>
  complex(
    a.re * b.re - a.im * b.im,
    a.re * b.im + a.im * b.re,
  );

const SINGLE_QUBIT_GATES: Record<string, Matrix2> = {
  H: [
    [complex(Math.SQRT1_2), complex(Math.SQRT1_2)],
    [complex(Math.SQRT1_2), complex(-Math.SQRT1_2)],
  ],
  X: [
    [complex(), complex(1)],
    [complex(1), complex()],
  ],
  Y: [
    [complex(), complex(0, -1)],
    [complex(0, 1), complex()],
  ],
  Z: [
    [complex(1), complex()],
    [complex(), complex(-1)],
  ],
  S: [
    [complex(1), complex()],
    [complex(), complex(0, 1)],
  ],
  SDG: [
    [complex(1), complex()],
    [complex(), complex(0, -1)],
  ],
  T: [
    [complex(1), complex()],
    [complex(), complex(Math.SQRT1_2, Math.SQRT1_2)],
  ],
  TDG: [
    [complex(1), complex()],
    [complex(), complex(Math.SQRT1_2, -Math.SQRT1_2)],
  ],
  SX: [
    [complex(0.5, 0.5), complex(0.5, -0.5)],
    [complex(0.5, -0.5), complex(0.5, 0.5)],
  ],
  ID: [
    [complex(1), complex()],
    [complex(), complex(1)],
  ],
};

function rotationMatrix(gateType: string, theta: number): Matrix2 {
  const half = theta / 2;

  if (gateType === 'RX') {
    return [
      [complex(Math.cos(half)), complex(0, -Math.sin(half))],
      [complex(0, -Math.sin(half)), complex(Math.cos(half))],
    ];
  }

  if (gateType === 'RY') {
    return [
      [complex(Math.cos(half)), complex(-Math.sin(half))],
      [complex(Math.sin(half)), complex(Math.cos(half))],
    ];
  }

  if (gateType === 'RZ') {
    return [
      [complex(Math.cos(half), -Math.sin(half)), complex()],
      [complex(), complex(Math.cos(half), Math.sin(half))],
    ];
  }

  return [
    [complex(1), complex()],
    [complex(), complex(Math.cos(theta), Math.sin(theta))],
  ];
}

function applySingleQubitGate(
  state: Complex[],
  matrix: Matrix2,
  qubit: number,
  qubitCount: number,
): Complex[] {
  const stride = 2 ** (qubitCount - qubit - 1);
  const next = state.map((amplitude) =>
    complex(amplitude.re, amplitude.im),
  );

  for (let block = 0; block < state.length; block += stride * 2) {
    for (let offset = 0; offset < stride; offset += 1) {
      const zeroIndex = block + offset;
      const oneIndex = zeroIndex + stride;

      next[zeroIndex] = add(
        multiply(matrix[0][0], state[zeroIndex]),
        multiply(matrix[0][1], state[oneIndex]),
      );

      next[oneIndex] = add(
        multiply(matrix[1][0], state[zeroIndex]),
        multiply(matrix[1][1], state[oneIndex]),
      );
    }
  }

  return next;
}

function applyCnot(
  state: Complex[],
  control: number,
  target: number,
  qubitCount: number,
): Complex[] {
  const controlMask = 2 ** (qubitCount - control - 1);
  const targetMask = 2 ** (qubitCount - target - 1);

  const next = state.map((amplitude) =>
    complex(amplitude.re, amplitude.im),
  );

  for (let index = 0; index < state.length; index += 1) {
    if (
      (index & controlMask) !== 0 &&
      (index & targetMask) === 0
    ) {
      const pairedIndex = index | targetMask;
      next[index] = state[pairedIndex];
      next[pairedIndex] = state[index];
    }
  }

  return next;
}

function applySwap(
  state: Complex[],
  first: number,
  second: number,
  qubitCount: number,
): Complex[] {
  if (first === second) return state;

  const firstMask = 2 ** (qubitCount - first - 1);
  const secondMask = 2 ** (qubitCount - second - 1);

  const next = state.map((amplitude) =>
    complex(amplitude.re, amplitude.im),
  );

  for (let index = 0; index < state.length; index += 1) {
    const firstBit = (index & firstMask) !== 0;
    const secondBit = (index & secondMask) !== 0;

    if (!firstBit && secondBit) {
      const pairedIndex = (index | firstMask) & ~secondMask;

      next[index] = state[pairedIndex];
      next[pairedIndex] = state[index];
    }
  }

  return next;
}

function getRotationAngle(
  operation: Circuit['operations'][number],
): number {
  return operation.params?.theta ?? Math.PI / 2;
}

export function simulateCircuit(
  circuit: Circuit,
): Record<string, number> {
  const qubitCount = Math.max(
    1,
    Math.min(6, circuit.qubitCount),
  );

  let state = Array.from(
    { length: 2 ** qubitCount },
    (_, index) => (index === 0 ? complex(1) : complex()),
  );

  const operations = [...circuit.operations].sort(
    (a, b) => a.step - b.step,
  );

  operations.forEach((operation) => {
    const gateType = operation.gateType.toUpperCase();

    if (SINGLE_QUBIT_GATES[gateType]) {
      state = applySingleQubitGate(
        state,
        SINGLE_QUBIT_GATES[gateType],
        operation.qubits[0],
        qubitCount,
      );
    } else if (
      ['RX', 'RY', 'RZ', 'P'].includes(gateType)
    ) {
      state = applySingleQubitGate(
        state,
        rotationMatrix(
          gateType,
          getRotationAngle(operation),
        ),
        operation.qubits[0],
        qubitCount,
      );
    } else if (gateType === 'CNOT') {
      state = applyCnot(
        state,
        operation.qubits[0],
        operation.qubits[1],
        qubitCount,
      );
    } else if (gateType === 'SWAP') {
      state = applySwap(
        state,
        operation.qubits[0],
        operation.qubits[1],
        qubitCount,
      );
    }
  });

  return Object.fromEntries(
    state.map((amplitude, index) => {
      const probability =
        amplitude.re ** 2 + amplitude.im ** 2;

      const basisState = index
        .toString(2)
        .padStart(qubitCount, '0');

      return [
        basisState,
        probability < EPSILON ? 0 : probability,
      ];
    }),
  );
}

export function probabilitiesToCounts(
  probabilities: Record<string, number>,
  shots = 1024,
): Record<string, number> {
  const entries = Object.entries(probabilities);

  const counts = Object.fromEntries(
    entries.map(([state, probability]) => [
      state,
      Math.floor(probability * shots),
    ]),
  );

  let remaining =
    shots -
    Object.values(counts).reduce(
      (sum, count) => sum + count,
      0,
    );

  const ranked = [...entries].sort(
    (a, b) => b[1] - a[1],
  );

  let cursor = 0;

  while (remaining > 0 && ranked.length > 0) {
    const state = ranked[cursor % ranked.length][0];
    counts[state] += 1;
    remaining -= 1;
    cursor += 1;
  }

  return counts;
}

const QASM_NAMES: Record<string, string> = {
  CNOT: 'cx',
  MEASURE: 'measure',
  SDG: 'sdg',
  TDG: 'tdg',
  SX: 'sx',
  ID: 'id',
};

export function circuitToOpenQasm(
  circuit: Circuit,
): string {
  const lines = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    '',
    `qubit[${circuit.qubitCount}] q;`,
    `bit[${circuit.qubitCount}] c;`,
    '',
  ];

  [...circuit.operations]
    .sort((a, b) => a.step - b.step)
    .forEach((operation) => {
      const gateType = operation.gateType.toUpperCase();
      const name =
        QASM_NAMES[gateType] ?? gateType.toLowerCase();

      if (gateType === 'MEASURE') {
        lines.push(
          `c[${operation.qubits[0]}] = measure q[${operation.qubits[0]}];`,
        );
      } else if (
        ['CNOT', 'SWAP'].includes(gateType)
      ) {
        lines.push(
          `${name} q[${operation.qubits[0]}], q[${operation.qubits[1]}];`,
        );
      } else if (
        ['RX', 'RY', 'RZ', 'P'].includes(gateType)
      ) {
        const theta =
          operation.params?.theta ?? Math.PI / 2;

        const thetaText =
          Math.abs(theta - Math.PI / 2) < EPSILON
            ? 'pi/2'
            : theta.toString();

        lines.push(
          `${name}(${thetaText}) q[${operation.qubits[0]}];`,
        );
      } else {
        lines.push(
          `${name} q[${operation.qubits[0]}];`,
        );
      }
    });

  return lines.join('\n');
}
