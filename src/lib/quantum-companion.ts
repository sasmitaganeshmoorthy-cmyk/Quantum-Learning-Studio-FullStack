export type CompanionLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CompanionCourseContext {
  routeLabel: string;
  currentTopic: string;
  masteryPercent: number;
  completedModules: string[];
  suggestedNext: string;
}

const learningRoutes: Array<{
  test: (pathname: string) => boolean;
  context: CompanionCourseContext;
}> = [
    {
      test: (pathname) => pathname.startsWith('/app/lessons/lesson-102'),
      context: {
        routeLabel: 'Bell States lesson',
        currentTopic: 'Entanglement and controlled gates',
        masteryPercent: 45,
        completedModules: ['Qubits', 'Bloch sphere', 'Superposition'],
        suggestedNext: 'Complete the Bell-state circuit and explain why CNOT creates correlation.',
      },
    },
    {
      test: (pathname) => pathname.startsWith('/app/lessons'),
      context: {
        routeLabel: 'Interactive lesson',
        currentTopic: 'Quantum foundations',
        masteryPercent: 68,
        completedModules: ['Classical bits versus qubits', 'Basic gates'],
        suggestedNext: 'Finish the lesson checkpoint and test the concept in the lab.',
      },
    },
    {
      test: (pathname) => pathname.startsWith('/app/lab'),
      context: {
        routeLabel: 'Quantum Lab',
        currentTopic: 'Circuit construction and simulation',
        masteryPercent: 62,
        completedModules: ['Qubits', 'Superposition', 'Basic measurements'],
        suggestedNext: 'Run the circuit, inspect Why Mode, and compare the observed probabilities with your prediction.',
      },
    },
    {
      test: (pathname) => pathname.startsWith('/app/challenges'),
      context: {
        routeLabel: 'Circuit challenge',
        currentTopic: 'Conceptual debugging',
        masteryPercent: 55,
        completedModules: ['Basic gates', 'Visual circuit building'],
        suggestedNext: 'Try one correction without a hint, then ask for the smallest useful clue.',
      },
    },
    {
      test: (pathname) => pathname.startsWith('/app/courses'),
      context: {
        routeLabel: 'Course module',
        currentTopic: 'Structured quantum learning',
        masteryPercent: 58,
        completedModules: ['Course orientation', 'Quantum foundations'],
        suggestedNext: 'Continue the next incomplete lesson in your course sequence.',
      },
    },
    {
      test: (pathname) => pathname.startsWith('/app/catalog'),
      context: {
        routeLabel: 'Course catalog',
        currentTopic: 'Learning-path selection',
        masteryPercent: 50,
        completedModules: ['Introductory assessment'],
        suggestedNext: 'Choose a course that matches your current mastery and career goal.',
      },
    },
    {
      test: (pathname) => pathname.startsWith('/app/progress'),
      context: {
        routeLabel: 'Mastery dashboard',
        currentTopic: 'Progress review',
        masteryPercent: 64,
        completedModules: ['Qubits', 'Bloch sphere', 'Superposition'],
        suggestedNext: 'Review entanglement before beginning phase kickback.',
      },
    },
  ];

export function isActiveLearningRoute(pathname: string): boolean {
  return learningRoutes.some(({ test }) => test(pathname));
}

export function getCompanionCourseContext(pathname: string): CompanionCourseContext {
  return (
    learningRoutes.find(({ test }) => test(pathname))?.context ?? {
      routeLabel: 'Learning workspace',
      currentTopic: 'Quantum computing',
      masteryPercent: 50,
      completedModules: ['Course orientation'],
      suggestedNext: 'Continue with the next recommended course activity.',
    }
  );
}

function levelPrefix(level: CompanionLevel): string {
  if (level === 'advanced') return 'Advanced view:';
  if (level === 'intermediate') return 'Intermediate view:';
  return 'Beginner-friendly view:';
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function roadmapResponse(question: string, level: CompanionLevel): string {
  const goal = question.includes('research')
    ? 'research'
    : includesAny(question, ['career', 'industry', 'job'])
      ? 'industry career'
      : 'general quantum literacy';
  const timeMatch = question.match(/(\d+)\s*(?:hours?|hrs?)\s*(?:\/|per)?\s*week/i);
  const hours = timeMatch ? Math.min(Math.max(Number(timeMatch[1]), 1), 20) : 5;
  const pace = hours <= 3 ? '12–16 weeks' : hours <= 7 ? '8–10 weeks' : '5–7 weeks';

  return `${levelPrefix(level)} Here is a ${pace} roadmap for ${goal} at about ${hours} hours per week:

1. Foundations — qubits, amplitudes, measurement, Bloch sphere and single-qubit gates.
2. Circuit reasoning — multi-qubit states, CNOT, entanglement, teleportation and noise.
3. Programming — implement the same circuits in Qiskit, then compare Cirq or PennyLane.
4. Algorithms — Deutsch–Jozsa, Grover search, quantum Fourier transform and Shor’s structure.
5. Real systems — hardware constraints, decoherence and quantum error correction.
6. Outcome project — ${goal === 'research' ? 'reproduce a small paper result and document assumptions' : goal === 'industry career' ? 'build a portfolio project with tests, simulation evidence and a technical README' : 'explain one algorithm and its limitations to a non-specialist'}.

Start with your current topic, then study in a learn → build → predict → run → explain loop. Tell me your exact prior knowledge and weekly availability if you want a more precise schedule.`;
}

function resourceResponse(level: CompanionLevel): string {
  const levelSpecific =
    level === 'advanced'
      ? 'Preskill’s lecture notes, Nielsen & Chuang, framework research demos, and recent peer-reviewed papers for your chosen topic.'
      : level === 'intermediate'
        ? 'IBM Quantum Learning, the Qiskit documentation, PennyLane demos, Cirq tutorials, and algorithm implementation exercises.'
        : 'IBM Quantum Learning fundamentals, Quantum Country, visual circuit exercises, and short guided labs before formal papers.';

  return `${levelPrefix(level)} Recommended supplementary resources:

• ${levelSpecific}
• Practice: rebuild each lesson circuit without copying, predict its output, and then simulate it.
• Paper-reading rule: begin with the abstract, problem, circuit figure and conclusion before reading every derivation.

These are curated starting points rather than live web search results. Ask for a topic such as “Grover resources” and I will narrow the list.`;
}

function hintResponse(question: string, context: CompanionCourseContext): string {
  const wantsSolution = includesAny(question, ['full solution', 'complete solution', 'show solution', 'give answer']);

  if (includesAny(question, ['bell', 'entangl', 'cnot']) || context.routeLabel === 'Circuit challenge') {
    return wantsSolution
      ? 'Full solution requested: initialize |00⟩, apply H to q0, apply CNOT with q0 as control and q1 as target, then measure both qubits. In an ideal simulator, only 00 and 11 should appear at approximately 50% each.'
      : 'Hint 1: Identify which qubit must enter superposition before the controlled operation. Then check whether any measurement collapses it too early. Try changing only the gate order before asking for the next hint.';
  }

  if (question.includes('grover')) {
    return wantsSolution
      ? 'Full structure: prepare equal superposition, apply an oracle that phase-marks the target, apply the diffusion operator, repeat about π√N/4 times, and measure.'
      : 'Hint 1: Separate the algorithm into two jobs—mark the desired state’s phase, then amplify that state’s amplitude. Which part of your circuit is responsible for each job?';
  }

  return wantsSolution
    ? 'Please paste the exact problem or circuit. I can provide a complete solution because you explicitly requested one.'
    : 'Start by writing the initial state, the intended final state, and the effect of each gate between them. Share the first point where your predicted state differs from the simulator, and I will give the next smallest hint.';
}

export function buildQuantumCompanionResponse(
  rawQuestion: string,
  level: CompanionLevel,
  context: CompanionCourseContext,
): string {
  const question = rawQuestion.trim().toLowerCase();

  if (!question) {
    return 'Ask me a quantum-computing question, request a roadmap, or ask what to study next.';
  }

  const introductionMatch = rawQuestion
    .trim()
    .match(
      /^(?:hi|hello|hey)[,! ]*(?:i am|i'm|my name is)\s+([a-z][a-z .'-]{0,40})[.!]?$/i
    );

  if (introductionMatch) {
    const learnerName = introductionMatch[1].trim();

    return `Hi ${learnerName}! Nice to meet you. I’m Qubit, your quantum-computing learning companion. What would you like to learn today?`;
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/i.test(rawQuestion.trim())) {
    return 'Hello! I’m Qubit. How can I help you learn quantum computing today?';
  }

  if (includesAny(question, ['roadmap', 'learning path', 'study plan'])) return roadmapResponse(question, level);

  if (includesAny(question, ['my progress', 'what next', 'next topic', 'review topic', 'review next'])) {
    return `You are currently working on ${context.currentTopic} with an estimated mastery of ${context.masteryPercent}% in this prototype.

Completed: ${context.completedModules.join(', ')}.
Recommended next step: ${context.suggestedNext}

Before moving forward, explain the current concept in your own words and complete one circuit without using a template. That checks understanding better than completion alone.`;
  }

  if (includesAny(question, ['hint', 'stuck', 'help with challenge', 'full solution', 'complete solution'])) return hintResponse(question, context);
  if (includesAny(question, ['resource', 'paper', 'video', 'book', 'exercise'])) return resourceResponse(level);

  if (includesAny(question, ['qubit', 'quantum bit'])) {
    if (level === 'advanced') {
      return `Advanced view: A pure qubit is a ray in a two-dimensional complex Hilbert space, |ψ⟩ = α|0⟩ + β|1⟩ with normalization |α|² + |β|² = 1 and global phase physically irrelevant. Mixed states require a density operator ρ; measurement probabilities follow the Born rule Tr(ρEᵢ).

The Bloch-vector representation writes ρ = (I + r·σ)/2. Pure states satisfy |r| = 1, while decoherence moves the state inside the sphere.`;
    }
    if (level === 'intermediate') {
      return `Intermediate view: A qubit is |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1. Relative phase affects interference even when two states have the same measurement probabilities in the computational basis. Single-qubit gates are unitary rotations of the Bloch vector.

Common misconception: probability alone does not fully describe a qubit; phase is also essential.`;
    }
    return `Beginner-friendly view: A qubit can be prepared as a combination of |0⟩ and |1⟩. Think of a direction on a globe rather than a coin secretly showing one side. Quantum gates change that direction, while measurement gives one classical result.

Common misconception: a qubit does not reveal both 0 and 1 simultaneously when measured.`;
  }

  if (question.includes('superposition')) {
    return `${levelPrefix(level)} Superposition means a quantum state is a linear combination of basis states. Applying H to |0⟩ produces |+⟩ = (|0⟩ + |1⟩)/√2, giving 50% measurement probabilities but also a definite relative phase.

Common misconception: superposition is not merely classical uncertainty. Interference can reveal the difference because quantum amplitudes—not ordinary probabilities—combine.`;
  }

  if (question.includes('entangl')) {
    if (level === 'advanced') {
      return `Advanced view: A bipartite pure state is entangled when its Schmidt rank is greater than one. For |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, each reduced density matrix is maximally mixed even though the joint state is pure. Bell-basis correlations can violate a Bell inequality, ruling out local hidden-variable explanations.

Correlation in one basis alone is not sufficient evidence; characterization requires measurements across appropriate bases.`;
    }
    return `${levelPrefix(level)} Entanglement means the joint quantum state cannot be described as two independent qubit states. Build the Bell state with H on q0 → CNOT(q0,q1) → measure. You should observe correlated 00 and 11 outcomes.

${level === 'intermediate' ? 'Mathematically, (|00⟩ + |11⟩)/√2 cannot be factored into |a⟩⊗|b⟩. The individual qubits have no pure state of their own.' : 'Analogy: the two qubits behave like one coordinated quantum system, not two separate hidden coins.'}

Common misconception: ordinary correlation alone does not prove entanglement.`;
  }

  if (question.includes('grover')) {
    return `${levelPrefix(level)} Grover’s algorithm searches an unstructured space of N possibilities using about O(√N) oracle queries. It alternates an oracle phase mark with a diffusion step that amplifies the marked state.

Visual description: imagine rotating a state vector toward the correct answer a little on every iteration. Too many iterations rotate past it, so iteration count matters.`;
  }

  if (includesAny(question, ['shor', 'factoring'])) {
    return `${levelPrefix(level)} Shor’s algorithm reduces integer factoring to quantum period finding. The quantum part prepares a superposition, evaluates modular exponentiation and uses the inverse quantum Fourier transform to extract information about a period. Classical post-processing then derives factors.

Common misconception: the QFT alone does not factor numbers; efficient reversible modular arithmetic is a major part of the circuit.`;
  }

  if (includesAny(question, ['qft', 'quantum fourier'])) {
    return `${levelPrefix(level)} The quantum Fourier transform maps computational-basis amplitudes into phase-frequency information. It uses Hadamard and controlled-phase rotations and is central to phase estimation and Shor’s period-finding routine.

Unlike a classical FFT, QFT usually prepares a transformed quantum state; reading every amplitude directly would require many measurements.`;
  }

  if (includesAny(question, ['superconduct', 'trapped ion', 'topological', 'hardware', 'physical qubit'])) {
    return `${levelPrefix(level)} Major hardware approaches trade off speed, fidelity, connectivity and engineering complexity:

• Superconducting qubits: fast gates and mature fabrication, but require extreme cryogenic control.
• Trapped ions: high-fidelity operations and long coherence, with typically slower gates.
• Topological qubits: aim for hardware-level error resilience, but remain an active research direction.

No platform is universally best; evaluate it against the algorithm, error rates, connectivity and scale required.`;
  }

  if (includesAny(question, ['error correction', 'surface code', 'logical qubit', 'decoherence'])) {
    return `${levelPrefix(level)} Quantum error correction protects logical information by encoding it across many physical qubits and repeatedly measuring error syndromes without directly measuring the protected logical state.

The surface code is prominent because it uses local interactions and has a useful threshold concept. Common misconception: error correction does not clone an unknown quantum state; it distributes logical information through entanglement.`;
  }

  if (includesAny(question, ['qiskit', 'cirq', 'pennylane', 'framework'])) {
    return `${levelPrefix(level)} Framework choice depends on your goal:

• Qiskit — broad circuit construction, transpilation and IBM-oriented workflows.
• Cirq — explicit circuit and device modeling in the Google quantum ecosystem.
• PennyLane — differentiable quantum programming and hybrid quantum machine learning.

The learning platform stores a framework-neutral circuit model, then generates framework-specific code so you can compare syntax without changing the underlying quantum logic.`;
  }

  if (includesAny(question, ['application', 'industry', 'use case', 'real world'])) {
    return `${levelPrefix(level)} Quantum-computing applications are explored in chemistry and materials simulation, optimization, cryptanalysis and cryptography planning, sensing, and hybrid machine-learning research.

Important reality check: many proposed uses are still experimental. A strong analysis compares the quantum method with the best classical baseline, includes hardware noise and total resource cost, and avoids claiming advantage from a small demonstration alone.`;
  }

  return `I’m specialized in quantum computing. I can help with qubits, superposition, entanglement, quantum gates, Grover, Shor, QFT, hardware, error correction, Qiskit, Cirq, PennyLane, applications, roadmaps and course progress.

You are currently in ${context.routeLabel}, studying ${context.currentTopic}. Try asking “Explain this at my level,” “Give me a hint,” “Build an industry roadmap for 5 hours per week,” or “What should I review next?”`;
}
