import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CircuitBuilder } from '../components/quantum/circuit-builder';
import { Circuit } from '../lib/api/types';

describe('CircuitBuilder Keyboard Accessibility', () => {
  let initialCircuit: Circuit;
  const mockOnChange = vi.fn();
  const mockSetSelectedPaletteGate = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockSetSelectedPaletteGate.mockClear();
    initialCircuit = {
      id: 'test-circuit',
      name: 'Test Circuit',
      qubitCount: 2,
      stepCount: 4,
      operations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  it('renders qubit wires and step grid cells', () => {
    render(
      <CircuitBuilder
        circuit={initialCircuit}
        onChange={mockOnChange}
        selectedPaletteGate={null}
        setSelectedPaletteGate={mockSetSelectedPaletteGate}
      />
    );

    // Verify qubit wires labels are present
    expect(screen.getByText('q[0]')).toBeInTheDocument();
    expect(screen.getByText('q[1]')).toBeInTheDocument();
  });

  it('handles keyboard navigation and gate placement', () => {
    render(
      <CircuitBuilder
        circuit={initialCircuit}
        onChange={mockOnChange}
        selectedPaletteGate="H"
        setSelectedPaletteGate={mockSetSelectedPaletteGate}
      />
    );

    const grid = screen.getByRole('grid');
    grid.focus();

    // Navigating Right and Down using keyboard arrows
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    
    // Pressing Enter to drop the "H" gate
    fireEvent.keyDown(grid, { key: 'Enter' });

    // Expect the onChange handler to have been called with the H gate placed on q[1] at step 1
    expect(mockOnChange).toHaveBeenCalled();
    const updatedCircuit = mockOnChange.mock.calls[0][0] as Circuit;
    expect(updatedCircuit.operations.length).toBe(1);
    expect(updatedCircuit.operations[0].gateType).toBe('H');
    expect(updatedCircuit.operations[0].qubits).toContain(1);
    expect(updatedCircuit.operations[0].step).toBe(1);

    // Verify the palette selection buffer is cleared after dropping
    expect(mockSetSelectedPaletteGate).toHaveBeenCalledWith(null);
  });
});
