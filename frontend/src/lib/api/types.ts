export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  streak: number;
  xp: number;
  avatarUrl?: string;
  joinedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  explanationLevel: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  soundEnabled: boolean;
  screenReaderOptimized: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string; // e.g. "4 hours"
  modulesCount: number;
  lessonsCount: number;
  progressPercent: number;
  frameworks: string[]; // e.g. ["Qiskit", "Cirq"]
  outcomes: string[];
  prerequisites: string[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  contentMarkdown: string;
  order: number;
  isCompleted: boolean;
  xpReward: number;
  blochSphereInitialState?: { theta: number; phi: number };
  circuitTemplate?: Circuit;
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  courses: Course[];
  completedCoursesCount: number;
}

export interface ConceptMastery {
  conceptId: string;
  name: string;
  category: 'foundations' | 'math' | 'algorithms' | 'advanced';
  masteryPercent: number; // 0 to 100
  status: 'locked' | 'learning' | 'mastered' | 'review_needed';
  recommendedNextActivity?: {
    type: 'lesson' | 'challenge' | 'lab';
    id: string;
    label: string;
  };
  dependencies: string[]; // IDs of prerequisite concepts
}

export interface QuantumGate {
  type: string; // e.g. "H", "X", "Y", "Z", "CNOT", "SWAP", "PHASE", "MEASURE"
  name: string; // e.g. "Hadamard", "Pauli X"
  description: string;
  qubitCount: number;
  params?: string[]; // e.g. ["theta", "phi", "lambda"]
  iconName?: string;
}

export interface CircuitOperation {
  id: string;
  gateType: string;
  qubits: number[]; // Index of qubits this gate is on, e.g. [0] or [0, 1] for CNOT (0 = control, 1 = target)
  step: number; // Time step / column index
  params?: Record<string, number>; // e.g. { theta: 1.57 }
}

export interface Circuit {
  id: string;
  name: string;
  qubitCount: number;
  stepCount: number;
  operations: CircuitOperation[];
  createdAt: string;
  updatedAt: string;
}

export interface ConceptualError {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'error';
  qubitIndices: number[];
  stepIndex: number;
  remedyAction: string;
  explanation: string;
}

export interface CircuitValidationResult {
  isValid: boolean;
  errors: ConceptualError[];
}

export interface FrameworkConversion {
  qiskit: string;
  openqasm: string;
  cirq: string;
  pennylane: string;
}

export interface SimulationRequest {
  circuit: Circuit;
  backend: 'ideal_simulator' | 'noisy_simulator' | 'quantum_hardware_ibmq';
  shots: number;
  noiseModelId?: string;
  seed?: number;
}

export type SimulationJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SimulationJob {
  id: string;
  status: SimulationJobStatus;
  requestedAt: string;
  completedAt?: string;
  errorMessage?: string;
  backend: string;
  shots: number;
}

export interface StateVectorEntry {
  state: string; // e.g. "|00>", "|01>"
  amplitudeReal: number;
  amplitudeImag: number;
  probability: number;
}

export interface GateExecutionStep {
  stepIndex: number;
  activeOperation?: CircuitOperation;
  stateVector: StateVectorEntry[];
  blochState: Record<number, { x: number; y: number; z: number }>; // qubit index -> coordinates
  probabilities: Record<string, number>; // state -> probability
  explanation: string;
}

export interface SimulationResult {
  jobId: string;
  counts: Record<string, number>; // e.g. {"00": 512, "11": 512}
  probabilities: Record<string, number>; // e.g. {"00": 0.5, "11": 0.5}
  stateVector?: StateVectorEntry[];
  executionSteps: GateExecutionStep[];
  entropy?: number;
  quantumVolumeCost?: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  contextType: 'lesson' | 'circuit' | 'general';
  contextId?: string;
  createdAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  timeLimitMinutes?: number;
  xpReward: number;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, number>; // questionId -> selectedIndex
  scorePercent?: number;
  passed?: boolean;
  misconceptionsDetected: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredConcepts: string[];
  estimatedTimeMinutes: number;
  xpReward: number;
  startingCircuit: Circuit;
  targetStateVector?: StateVectorEntry[];
  validationCriteria: string; // Description of target outcome
  hints: string[];
}

export interface ChallengeEvaluation {
  isCorrect: boolean;
  feedback: string;
  misconceptionDetected?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  circuit: Circuit;
  framework: 'qiskit' | 'cirq' | 'pennylane' | 'openqasm';
  backend: string;
  shots: number;
  collaborators: { name: string; avatarUrl?: string }[];
  lastModified: string;
  versionCount: number;
}

export interface Classroom {
  id: string;
  name: string;
  instructorName: string;
  studentCount: number;
  averageMastery: number;
  inviteCode: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  targetType: 'lesson' | 'challenge' | 'assessment';
  targetId: string;
  dueDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'closed';
  submissionsCount: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  lessonsCompleted: number;
  challengesCompleted: number;
  averageScore: number;
  masteryMap: Record<string, number>; // conceptId -> masteryPercent
  lastActive: string;
}

export interface MisconceptionInsight {
  id: string;
  classroomId: string;
  conceptId: string;
  conceptName: string;
  percentageAffected: number; // e.g. 60 for 60%
  description: string;
  exampleErrorSnippet: string; // Markdown or circuit state explanation
  remedyAction: string;
  affectedStudentIds: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'classroom';
  read: boolean;
  createdAt: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
export interface Video {
  id: string;
  title: string;
  level: 'intermediate' | 'advanced';
  description: string;
  videoUrl: string;
  order: number;
}
