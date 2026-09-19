'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Atom,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileCode,
  LayoutGrid,
  Sliders,
  Layers,
  Loader2
} from 'lucide-react';
import { mockApi } from '@/lib/api/mock-client';
import { simulateQuantumCircuit, type QuantumBackend } from '@/lib/api/quantum-client';
import { Circuit, CircuitValidationResult, SimulationResult } from '@/lib/api/types';
import { CircuitBuilder } from '@/components/quantum/circuit-builder';
import { BlochSphere } from '@/components/quantum/bloch-sphere';
import { AiTutor } from '@/components/learning/ai-tutor';

export default function QuantumLab() {
  type Framework = 'qiskit' | 'cirq' | 'pennylane' | 'openqasm';
  type Backend = 'ideal_simulator' | 'noisy_simulator' | 'quantum_hardware_ibmq' | 'real_quantum_backend';

  // Current active visual circuit state
  const [circuit, setCircuit] = useState<Circuit>({
    id: 'sandbox-circuit',
    name: 'My Sandbox Circuit',
    qubitCount: 2,
    stepCount: 8,
    operations: [
      { id: 'op1', gateType: 'H', qubits: [0], step: 0 },
      { id: 'op2', gateType: 'CNOT', qubits: [0, 1], step: 1 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Editor states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'visual' | 'code'>('visual');
  const [selectedPaletteGate, setSelectedPaletteGate] = useState<string | null>(null);
  const [activeCodeFramework, setActiveCodeFramework] = useState<Framework>('qiskit');
  
  // Simulator configurations
  const [shots, setShots] = useState(1024);
  const [backend, setBackend] = useState<Backend>('ideal_simulator');
  const [quantumBackend, setQuantumBackend] = useState<QuantumBackend>('qiskit-aer');

  const [realSimulationResult, setRealSimulationResult] = useState<{
    backend: string;
    provider: string;
    counts: Record<string, number>;
    probabilities: Record<string, number>;
    shots: number;
    execution_time_ms: number;
    local: boolean;
  } | null>(null);

  const [realSimulationError, setRealSimulationError] = useState<string | null>(null);
  
  // Validation state (re-run whenever operations change)
  const [validation, setValidation] = useState<CircuitValidationResult>({ isValid: true, errors: [] });
  
  // Simulation results
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // Why Mode Step Debugger
  const [whyStepIndex, setWhyStepIndex] = useState(0);
  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'diagnostics' | 'code'>('canvas');

  // Trigger validation automatically
  useEffect(() => {
    const runVal = async () => {
      const res = await mockApi.validateCircuit(circuit);
      setValidation(res);
    };
    runVal();
  }, [circuit]);

  // Execute simulation job
  const handleRealQuantumSimulation = async () => {
    setLoadingSimulation(true);
    setRealSimulationError(null);
    setRealSimulationResult(null);

    try {
      const result = await simulateQuantumCircuit({
        circuit,
        backend: quantumBackend,
        shots,
      });

      setRealSimulationResult(result);
      setWhyStepIndex(0);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Unable to run the real quantum simulation.';

      setRealSimulationError(message);
      console.error('Real quantum simulation failed:', error);
    } finally {
      setLoadingSimulation(false);
    }
  };
  const handleRunSimulation = async () => {
    setLoadingSimulation(true);
    setSimulationResult(null);
    try {
      const res = await mockApi.simulateCircuit(circuit, backend, shots);
      setSimulationResult(res);
      setWhyStepIndex(0); // reset to initial step
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSimulation(false);
    }
  };

  // Convert visual circuit to code
  const codeOutput = mockApi.convertCircuitToCode(circuit, activeCodeFramework);

  // Palette gates available
  const gatePalette = [
    { type: 'H', name: 'Hadamard', desc: 'Create superposition states' },
    { type: 'X', name: 'Pauli-X', desc: 'Invert qubit state (NOT)' },
    { type: 'Y', name: 'Pauli-Y', desc: 'Pauli-Y rotation' },
    { type: 'Z', name: 'Pauli-Z', desc: 'Pauli-Z phase flip' },
    { type: 'CNOT', name: 'CNOT', desc: 'Entangling Controlled-NOT' },
    { type: 'MEASURE', name: 'Measure', desc: 'Collapse to classical bit' }
  ];

  // Active Why step parameters
  const activeWhyStep = simulationResult?.executionSteps[whyStepIndex];

  return (
    <div className="h-full min-h-0 min-w-0 flex flex-col overflow-hidden font-sans">
      
      {/* Top Toolbar Navigation Header */}
      <header className="lab-command-header border-b border-cyan-300/20 px-3 py-3 sm:px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between shrink-0 gap-3 lg:gap-4">
        <div className="lab-command-header__image" aria-hidden="true">
          <Image src="/images/quantum/quantum-lab-workbench.png" alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="lab-command-header__scrim" aria-hidden="true" />
        <div className="relative z-10 flex w-full lg:w-auto items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-medium bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,.35)] flex items-center justify-center">
            <Atom size={18} />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">Live visual workspace</span>
            <h1 className="font-bold text-sm leading-tight text-white">Quantum Lab</h1>
            <span className="text-[10px] text-slate-300">Design · simulate · understand</span>
          </div>
        </div>

        {/* Configurations inputs */}
        <div className="relative z-10 grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] xl:flex xl:w-auto xl:items-center xl:gap-4 shrink-0">
          {/* Workspace mode toggle */}
          <div className="hidden xl:flex border border-border-color p-0.5 rounded-medium bg-surface-hover/30">
            <button
              onClick={() => setActiveWorkspaceTab('visual')}
              className={`px-3 py-1 rounded-small text-caption font-bold flex items-center gap-1.5 ${
                activeWorkspaceTab === 'visual' ? 'bg-surface text-primary-color shadow-xs' : 'text-text-secondary'
              }`}
            >
              <LayoutGrid size={14} /> Visual Canvas
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('code')}
              className={`px-3 py-1 rounded-small text-caption font-bold flex items-center gap-1.5 ${
                activeWorkspaceTab === 'code' ? 'bg-surface text-primary-color shadow-xs' : 'text-text-secondary'
              }`}
            >
              <FileCode size={14} /> Code Editor
            </button>
          </div>

          {/* Simulator options */}
          <div className="grid min-w-0 grid-cols-1 gap-2 text-caption sm:grid-cols-2 xl:flex xl:items-center">
            <Sliders size={14} className="hidden text-text-secondary xl:block" aria-hidden="true" />
            <label className="sr-only" htmlFor="simulation-backend">Simulation backend</label>
            <select
              id="simulation-backend"
              value={backend}
              onChange={(event) => setBackend(event.target.value as Backend)}
              className="min-w-0 w-full bg-surface border border-border-color rounded-medium px-3 py-1 text-ellipsis"
            >
              <option value="ideal_simulator">Ideal Statevector Simulator</option>
              <option value="noisy_simulator">Qiskit Fake Aer Noisy Simulator</option>
              <option value="quantum_hardware_ibmq">IBMQ Brisbane Hardware Cloud</option>
              <option value="real_quantum_backend">Real Quantum Backend</option>
            </select>

            {backend === 'real_quantum_backend' && (
              <>
                <label className="sr-only" htmlFor="quantum-backend">Real quantum backend</label>
                <select
                  id="quantum-backend"
                  value={quantumBackend}
                  onChange={(event) => setQuantumBackend(event.target.value as QuantumBackend)}
                  className="min-w-0 w-full bg-surface border border-border-color rounded-medium px-3 py-1 text-ellipsis"
                >
                  <option value="qiskit-aer">Qiskit Aer</option>
                  <option value="pennylane">PennyLane</option>
                  <option value="cirq">Cirq</option>
                  <option value="qbraid-ionq">qBraid / IonQ</option>
                </select>
              </>
            )}

            <label className="sr-only" htmlFor="simulation-shots">Number of simulation shots</label>
            <select
              id="simulation-shots"
              value={shots}
              onChange={(event) => setShots(Number(event.target.value))}
              className="min-w-0 w-full bg-surface border border-border-color rounded-medium px-3 py-1"
            >
              <option value={100}>100 Shots</option>
              <option value={1024}>1024 Shots</option>
              <option value={8192}>8192 Shots</option>
            </select>
          </div>

          {/* Run button action */}
          <button
            onClick={backend === 'real_quantum_backend' ? handleRealQuantumSimulation : handleRunSimulation}
            disabled={loadingSimulation || circuit.operations.length === 0}
            className="w-full sm:w-auto px-4 py-1.5 bg-primary-color hover:bg-primary-hover text-white text-caption font-bold rounded-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30"
            aria-describedby="simulation-status"
          >
            {loadingSimulation ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
            Run Simulation
          </button>
          <span id="simulation-status" className="sr-only" aria-live="polite">
            {loadingSimulation ? 'Simulation is running' : simulationResult ? 'Simulation completed' : 'Simulation has not been run'}
          </span>
        </div>
      </header>

      {/* Mobile Tab Swapper */}
      <div className="flex xl:hidden bg-surface border-b border-border-color shrink-0 p-1" role="tablist" aria-label="Quantum Lab workspace">
        <button
          onClick={() => {
            setActiveMobileTab('canvas');
            setActiveWorkspaceTab('visual');
          }}
          role="tab"
          aria-selected={activeMobileTab === 'canvas'}
          className={`min-h-11 flex-1 px-1 py-2 text-xs font-bold text-center rounded-medium transition-all ${
            activeMobileTab === 'canvas' ? 'bg-primary-color text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Visual Canvas
        </button>
        <button
          onClick={() => {
            setActiveMobileTab('code');
            setActiveWorkspaceTab('code');
          }}
          role="tab"
          aria-selected={activeMobileTab === 'code'}
          className={`min-h-11 flex-1 px-1 py-2 text-xs font-bold text-center rounded-medium transition-all ${
            activeMobileTab === 'code' ? 'bg-primary-color text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => {
            setActiveMobileTab('diagnostics');
          }}
          role="tab"
          aria-selected={activeMobileTab === 'diagnostics'}
          className={`min-h-11 flex-1 px-1 py-2 text-xs font-bold text-center rounded-medium transition-all ${
            activeMobileTab === 'diagnostics' ? 'bg-primary-color text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Diagnostics
        </button>
      </div>

      {/* Main split work region */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        
        {/* LEFT COLUMN: Gate Palette */}
        <aside className="w-56 border-r border-border-color bg-surface p-4 flex flex-col gap-4 shrink-0 overflow-y-auto hidden md:flex">
          <div>
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block mb-2">Gate Palette</span>
            <div className="grid grid-cols-2 gap-2">
              {gatePalette.map((gate) => {
                const isSelected = selectedPaletteGate === gate.type;
                return (
                  <button
                    key={gate.type}
                    onClick={() => setSelectedPaletteGate(isSelected ? null : gate.type)}
                    className={`p-3 rounded-medium border text-center relative flex flex-col items-center justify-center group hover:border-primary-color/50 transition-all ${
                      isSelected
                        ? 'border-primary-color bg-primary-color/10 ring-2 ring-primary-color'
                        : 'border-border-color bg-background'
                    }`}
                    title={gate.desc}
                  >
                    <span className="font-mono font-bold text-body-large text-primary-color">{gate.type}</span>
                    <span className="text-[9px] text-text-secondary font-semibold">{gate.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border-color pt-4 flex-1">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block mb-2">Project Explorer</span>
            <div className="text-caption text-text-secondary bg-background p-3 rounded-medium border border-border-color/50">
              <span className="font-bold text-text-primary block">Bell State Sandbox</span>
              <span>2 Qubits • 8 Steps max</span>
            </div>
          </div>
        </aside>

        {/* MIDDLE SECTION: Visual Canvas OR Code editor */}
        <div className={`min-w-0 flex-1 flex-col overflow-hidden bg-background ${(activeMobileTab === 'canvas' || activeMobileTab === 'code') ? 'flex' : 'hidden'} xl:flex`}>
          <div className="flex-1 min-h-0 p-2 sm:p-4 overflow-y-auto overscroll-contain">
            {activeWorkspaceTab === 'visual' ? (
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="flex-1 min-h-[300px] overflow-hidden">
                  <CircuitBuilder
                    circuit={circuit}
                    onChange={setCircuit}
                    selectedPaletteGate={selectedPaletteGate}
                    setSelectedPaletteGate={setSelectedPaletteGate}
                  />
                </div>
                
                {/* Horizontal Gate Palette (Visible on mobile/tablet when left aside is hidden) */}
                <div className="flex md:hidden min-w-0 bg-surface border border-border-color p-2 sm:p-3 rounded-large shrink-0 items-center gap-2">
                  <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase hidden sm:inline">Select Gate:</span>
                  <div className="scrollbar-hidden flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain pb-1">
                    {gatePalette.map((gate) => {
                      const isSelected = selectedPaletteGate === gate.type;
                      return (
                        <button
                          key={gate.type}
                          onClick={() => setSelectedPaletteGate(isSelected ? null : gate.type)}
                          className={`min-w-11 shrink-0 px-3 py-1.5 rounded-medium border font-mono font-bold text-body-small transition-all ${
                            isSelected
                              ? 'border-primary-color bg-primary-color/10 text-primary-color shadow-xs'
                              : 'border-border-color bg-background text-text-secondary hover:text-text-primary'
                          }`}
                          title={gate.desc}
                        >
                          {gate.type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Code Editor tab */
              <div className="flex flex-col h-full bg-surface border border-border-color rounded-large overflow-hidden">
                <div className="bg-surface-hover/50 px-2 sm:px-4 py-2 border-b border-border-color overflow-x-auto scrollbar-hidden">
                  <div className="flex min-w-max gap-2" role="tablist" aria-label="Code framework">
                    {(['qiskit', 'cirq', 'pennylane', 'openqasm'] as Framework[]).map((framework) => (
                      <button
                        key={framework}
                        onClick={() => setActiveCodeFramework(framework)}
                        role="tab"
                        aria-selected={activeCodeFramework === framework}
                        className={`min-h-11 px-3 py-1 rounded-small text-caption font-bold capitalize ${
                          activeCodeFramework === framework ? 'bg-surface text-primary-color shadow-xs' : 'text-text-secondary'
                        }`}
                      >
                        {framework === 'openqasm' ? 'OpenQASM' : framework}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={codeOutput}
                  readOnly
                  aria-label={`${activeCodeFramework} generated circuit code`}
                  className="min-h-[320px] flex-1 p-4 font-mono text-body-small bg-background text-text-secondary dark:text-slate-200 resize-none overflow-auto leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* LOWER SPLIT PANEL: Simulation results and "Why Mode" */}
          <div className="h-[min(40vh,20rem)] sm:h-64 border-t border-border-color bg-surface flex flex-col shrink-0 overflow-hidden">
            {simulationResult ? (
              <div className="flex flex-col md:flex-row h-full divide-y md:divide-y-0 md:divide-x divide-border-color overflow-hidden">
                
                {/* Visual outputs: Probabilities histograms */}
                <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-border-color pb-1.5">
                    <span className="text-caption font-bold text-text-secondary uppercase">Histogram Results</span>
                    <span className="text-[10px] text-text-secondary">Shots count: {shots}</span>
                  </div>

                  {/* Histograms bar mapping */}
                  <div className="flex-1 flex flex-col justify-center gap-2 pt-2">
                    {Object.entries(simulationResult.probabilities).map(([state, prob]) => (
                      <div key={state} className="flex items-center gap-3">
                        <span className="font-mono text-caption w-10 text-right">{state}</span>
                        <div className="flex-1 bg-background border border-border-color/30 h-4 rounded-pill overflow-hidden">
                          <div
                            className="bg-primary-color h-full transition-all duration-slow"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-caption w-12 font-bold">{(prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Mode Step-by-Step interactive debugger */}
                <div className="w-full md:w-[380px] p-4 flex flex-col justify-between overflow-y-auto shrink-0">
                  <div className="flex justify-between items-center border-b border-border-color pb-1.5">
                    <span className="text-caption font-bold text-primary-color tracking-wide uppercase flex items-center gap-1">
                      <Sparkles size={12} /> Why Mode Debugger
                    </span>
                    <span className="text-caption text-text-secondary">
                      Step {whyStepIndex} of {simulationResult.executionSteps.length - 1}
                    </span>
                  </div>

                  {/* Explanations text content */}
                  {activeWhyStep && (
                    <div className="flex-1 py-3 text-caption space-y-2">
                      <p className="font-bold text-text-primary leading-tight">
                        {activeWhyStep.activeOperation
                          ? `Step ${whyStepIndex}: Applied ${activeWhyStep.activeOperation.gateType} on qubit ${activeWhyStep.activeOperation.qubits[0]}`
                          : 'Initial State'}
                      </p>
                      <p className="text-text-secondary leading-relaxed line-clamp-3">
                        {activeWhyStep.explanation}
                      </p>
                    </div>
                  )}

                  {/* Debug Controls action bar */}
                  <div className="flex justify-between items-center pt-2 border-t border-border-color shrink-0">
                    <button
                      onClick={() => whyStepIndex > 0 && setWhyStepIndex(whyStepIndex - 1)}
                      disabled={whyStepIndex === 0}
                      className="py-1 px-2.5 border border-border-color rounded-medium text-[11px] font-bold hover:bg-surface-hover disabled:opacity-30"
                    >
                      Previous Gate
                    </button>
                    <button
                      onClick={() =>
                        whyStepIndex < simulationResult.executionSteps.length - 1 &&
                        setWhyStepIndex(whyStepIndex + 1)
                      }
                      disabled={whyStepIndex === simulationResult.executionSteps.length - 1}
                      className="py-1 px-3 bg-primary-color hover:bg-primary-hover text-white rounded-medium text-[11px] font-bold disabled:opacity-30"
                    >
                      Next Gate
                    </button>
                  </div>
                </div>
                
                {/* Coordinate Bloch Sphere visualization for step */}
                <div className="w-[200px] p-2 flex items-center justify-center shrink-0 hidden lg:flex">
                  {activeWhyStep && (
                    <BlochSphere
                      theta={activeWhyStep.blochState[0]?.z === 1.0 ? 0 : Math.PI / 2}
                      phi={0}
                    />
                  )}
                </div>

              </div>
            ) : (
              /* Empty run state */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2">
                <Layers className="text-border-color" size={32} />
                <span className="font-bold text-body-small">No Simulation Data</span>
                <p className="text-caption text-text-secondary">Select Run Simulation in the toolbar to execute circuit steps.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Validation Results and AI Assistant */}
        <aside className={`min-w-0 w-full xl:w-80 border-l border-border-color bg-surface flex-col divide-y divide-border-color shrink-0 ${activeMobileTab === 'diagnostics' ? 'flex' : 'hidden'} xl:flex`} aria-label="Circuit diagnostics and AI tutor">
          {/* Validation section */}
          <div className="p-4 space-y-4 max-h-[45%] overflow-y-auto">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block">Conceptual Diagnostics</span>
            
            {validation.errors.length > 0 ? (
              <div className="space-y-3">
                {validation.errors.map((err) => (
                  <div
                    key={err.id}
                    className={`p-3 rounded-medium border text-body-small space-y-2 ${
                      err.severity === 'error'
                        ? 'bg-red-50 dark:bg-red-950/20 border-error-color/30 text-error-color'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-warning-color/30 text-warning-color'
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                      <span className="font-bold leading-tight">{err.title}</span>
                    </div>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      {err.message}
                    </p>
                    <div className="text-[11px] border-t border-current/20 pt-1.5">
                      <span className="font-bold uppercase tracking-wider text-[9px] block">Remedy:</span>
                      <span className="text-text-primary font-medium">{err.remedyAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-medium bg-emerald-50 dark:bg-emerald-950/20 border border-success-color/30 text-success-color flex items-start gap-2">
                <CheckCircle className="shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-bold leading-tight block">Ideal Quantum Integrity</span>
                  <p className="text-caption text-text-secondary mt-1">No conceptual errors or inverse cancellations detected.</p>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible AI Tutor widget */}
          <div className="flex-1 overflow-hidden">
            <AiTutor contextType="circuit" contextId="sandbox-lab" />
          </div>
        </aside>
      </div>
    </div>
  );
}
