'use client';

import { useState, useRef } from 'react';
import { Atom, HelpCircle } from 'lucide-react';
import { Circuit, CircuitOperation } from '@/lib/api/types';

interface CircuitBuilderProps {
  circuit: Circuit;
  onChange: (circuit: Circuit) => void;
  selectedPaletteGate: string | null;
  setSelectedPaletteGate: (gate: string | null) => void;
}

export function CircuitBuilder({
  circuit,
  onChange,
  selectedPaletteGate,
  setSelectedPaletteGate
}: CircuitBuilderProps) {
  // Focus cursor coordinates for keyboard-based grid navigation
  const [cursorQubit, setCursorQubit] = useState(0);
  const [cursorStep, setCursorStep] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  
  // Ref for the grid wrapper to trap key events when focused
  const gridRef = useRef<HTMLDivElement>(null);

  // Maximum dimensions
  const maxQubits = 4;

  // Keyboard navigation & placement controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let handled = false;

    switch (e.key) {
      case 'ArrowUp':
        if (cursorQubit > 0) {
          setCursorQubit((q) => q - 1);
          setAnnouncement(`Moved cursor to qubit ${cursorQubit - 1}, step ${cursorStep}`);
        }
        handled = true;
        break;
      case 'ArrowDown':
        if (cursorQubit < circuit.qubitCount - 1) {
          setCursorQubit((q) => q + 1);
          setAnnouncement(`Moved cursor to qubit ${cursorQubit + 1}, step ${cursorStep}`);
        }
        handled = true;
        break;
      case 'ArrowLeft':
        if (cursorStep > 0) {
          setCursorStep((s) => s - 1);
          setAnnouncement(`Moved cursor to qubit ${cursorQubit}, step ${cursorStep - 1}`);
        }
        handled = true;
        break;
      case 'ArrowRight':
        if (cursorStep < circuit.stepCount - 1) {
          setCursorStep((s) => s + 1);
          setAnnouncement(`Moved cursor to qubit ${cursorQubit}, step ${cursorStep + 1}`);
        }
        handled = true;
        break;
      
      case 'Enter':
      case ' ': // Spacebar
        if (selectedPaletteGate) {
          placeGate(selectedPaletteGate, cursorQubit, cursorStep);
          handled = true;
        } else {
          // If a gate exists, open parameter modal or show details
          const existing = getOpAt(cursorQubit, cursorStep);
          if (existing) {
            setAnnouncement(`Selected gate ${existing.gateType} on qubit ${cursorQubit}`);
            handled = true;
          }
        }
        break;

      case 'Delete':
      case 'Backspace':
        removeGateAt(cursorQubit, cursorStep);
        handled = true;
        break;

      default:
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const getOpAt = (qubit: number, step: number): CircuitOperation | undefined => {
    return circuit.operations.find((op) => op.step === step && op.qubits.includes(qubit));
  };

  const placeGate = (gateType: string, qubit: number, step: number) => {
    // 1. Remove existing operation at cell
    const updatedOps = circuit.operations.filter(
      (op) => !(op.step === step && op.qubits.includes(qubit))
    );

    // 2. Set qubits layout. Multi-qubit gates (like CNOT) need target/control qubits
    let qubits = [qubit];
    if (gateType === 'CNOT') {
      // For CNOT, we automatically pair with next qubit if available, else previous
      const targetQ = qubit < circuit.qubitCount - 1 ? qubit + 1 : qubit - 1;
      qubits = [qubit, targetQ]; // index 0 is control, index 1 is target
    }

    const newOp: CircuitOperation = {
      id: `op-${gateType}-${qubit}-${step}-${circuit.operations.length + 1}`,
      gateType,
      qubits,
      step
    };

    updatedOps.push(newOp);

    onChange({
      ...circuit,
      operations: updatedOps
    });

    setAnnouncement(
      `Placed ${gateType} gate on qubit ${qubit}${
        gateType === 'CNOT' ? ` with target on qubit ${qubits[1]}` : ''
      } at step ${step}`
    );
    setSelectedPaletteGate(null); // Clear active buffer selection
  };

  const removeGateAt = (qubit: number, step: number) => {
    const existing = getOpAt(qubit, step);
    if (!existing) return;

    const updatedOps = circuit.operations.filter((op) => op.id !== existing.id);

    onChange({
      ...circuit,
      operations: updatedOps
    });

    setAnnouncement(`Removed gate ${existing.gateType} from step ${step}`);
  };

  const handleCellClick = (qubit: number, step: number) => {
    setCursorQubit(qubit);
    setCursorStep(step);

    if (selectedPaletteGate) {
      placeGate(selectedPaletteGate, qubit, step);
    } else {
      const existing = getOpAt(qubit, step);
      if (existing) {
        // Toggle deletion or select
      }
    }
  };

  const addQubitWire = () => {
    if (circuit.qubitCount < maxQubits) {
      onChange({
        ...circuit,
        qubitCount: circuit.qubitCount + 1
      });
      setAnnouncement(`Added a new qubit wire. Total wires: ${circuit.qubitCount + 1}`);
    }
  };

  const removeQubitWire = () => {
    if (circuit.qubitCount > 1) {
      const nextCount = circuit.qubitCount - 1;
      // Remove operations lying on the removed wire
      const updatedOps = circuit.operations.filter((op) => !op.qubits.some((q) => q >= nextCount));
      onChange({
        ...circuit,
        qubitCount: nextCount,
        operations: updatedOps
      });
      setCursorQubit((current) => Math.min(current, nextCount - 1));
      setAnnouncement(`Removed the bottom qubit wire. Total wires: ${nextCount}`);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4 bg-surface p-3 sm:p-4 border border-border-color rounded-large shadow-xs min-h-full justify-between">
      
      {/* Accessibility announcer */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {/* Grid Canvas Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-color shrink-0">
        <div className="flex min-w-0 items-center gap-2">
          <Atom className="text-primary-color" size={20} />
          <span className="font-bold text-body-small">Circuit Grid Canvas</span>
        </div>
        
        {/* Qubit controller */}
        <div className="flex gap-2">
          <button
            onClick={removeQubitWire}
            disabled={circuit.qubitCount <= 1}
            className="min-w-11 py-1 px-2.5 border border-border-color rounded-medium text-caption font-semibold bg-background hover:bg-surface-hover transition-colors disabled:opacity-30"
            title="Remove bottom qubit wire"
          >
            - Qubit
          </button>
          <button
            onClick={addQubitWire}
            disabled={circuit.qubitCount >= maxQubits}
            className="min-w-11 py-1 px-2.5 bg-primary-color text-white rounded-medium text-caption font-bold hover:bg-primary-hover transition-colors disabled:opacity-30"
            title="Add a qubit wire"
          >
            + Qubit
          </button>
        </div>
      </div>

      {/* Visual Canvas Board */}
      <div className="scrollbar-hidden flex-1 flex items-center justify-start lg:justify-center p-1 sm:p-4 bg-background/30 rounded-medium border border-border-color/50 relative overflow-x-auto overscroll-x-contain min-h-[220px]" tabIndex={-1}>
        {/* Core grid focal zone */}
        <div
          ref={gridRef}
          role="grid"
          aria-label="Quantum circuit builder grid"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative flex min-w-max flex-col gap-6 sm:gap-8 py-4 px-2 select-none"
        >
          {/* Loop over Qubits rows */}
          {Array.from({ length: circuit.qubitCount }).map((_, qIdx) => (
            <div key={qIdx} className="flex items-center gap-2 sm:gap-4 relative" role="row">
              {/* Qubit label */}
              <span className="w-10 sm:w-12 text-caption font-mono font-bold text-text-secondary select-none" aria-hidden="true">
                q[{qIdx}]
              </span>

              {/* Wire line overlay */}
              <div className="absolute left-12 sm:left-16 right-0 h-0.5 bg-border-color top-1/2 -translate-y-1/2 z-0" />

              {/* Steps columns */}
              <div className="flex gap-3 sm:gap-6 lg:gap-8 relative z-10">
                {Array.from({ length: circuit.stepCount }).map((_, sIdx) => {
                  const op = getOpAt(qIdx, sIdx);
                  const isCursor = cursorQubit === qIdx && cursorStep === sIdx;
                  const isCNOTTarget = op?.gateType === 'CNOT' && op.qubits[1] === qIdx;
                  const isCNOTControl = op?.gateType === 'CNOT' && op.qubits[0] === qIdx;

                  return (
                    <div
                      key={sIdx}
                      role="gridcell"
                      aria-label={`${op?.gateType ?? 'Empty cell'}, qubit ${qIdx}, step ${sIdx}`}
                      aria-selected={isCursor}
                      onClick={() => handleCellClick(qIdx, sIdx)}
                      className={`h-11 w-11 sm:h-12 sm:w-12 rounded-medium flex items-center justify-center cursor-pointer relative transition-all ${
                        isCursor
                          ? 'ring-2 ring-primary-color bg-primary-color/5 scale-105'
                          : 'hover:bg-primary-color/5 bg-surface border border-dashed border-border-color/50'
                      }`}
                    >
                      {/* CNOT link vertical link overlay */}
                      {isCNOTControl && (
                        <div
                          className="absolute bg-primary-color w-0.5 z-0 pointer-events-none"
                          style={{
                            top: '50%',
                            height: `${Math.abs(op.qubits[1] - op.qubits[0]) * 80 - 12}px`,
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        />
                      )}

                      {/* Display Gate symbols */}
                      {op && !isCNOTTarget && (
                        <div
                          className={`h-9 w-9 rounded-small flex items-center justify-center font-mono font-bold text-caption shadow-xs text-white z-10 ${
                            op.gateType === 'MEASURE'
                              ? 'bg-text-secondary'
                              : op.gateType === 'CNOT'
                              ? 'bg-primary-color text-white'
                              : 'bg-primary-color'
                          }`}
                        >
                          {op.gateType === 'MEASURE' ? '🎛️' : op.gateType}
                        </div>
                      )}

                      {/* Render target dot for CNOT target wire */}
                      {isCNOTTarget && (
                        <div className="h-7 w-7 rounded-full border-2 border-primary-color bg-surface flex items-center justify-center z-10 font-bold font-mono text-primary-color shadow-xs text-caption">
                          +
                        </div>
                      )}

                      {/* Hover layout for active insertion buffer */}
                      {isCursor && selectedPaletteGate && !op && (
                        <span className="text-[10px] text-primary-color/60 font-mono font-bold uppercase animate-pulse">
                          Place
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Keyboard Navigation Tips */}
      <div className="flex gap-2 items-start text-xs text-text-secondary bg-surface-hover p-2 rounded-medium border border-border-color/50 shrink-0">
        <HelpCircle size={14} className="shrink-0 mt-0.5 text-primary-color" />
        <div>
          <p className="font-semibold text-text-primary">Keyboard Accessible Workflow</p>
          <p>Click the grid to focus. Use <strong>Arrows</strong> to navigate, <strong>Enter</strong> to place a selected gate, and <strong>Delete</strong> to remove.</p>
        </div>
      </div>

    </div>
  );
}
