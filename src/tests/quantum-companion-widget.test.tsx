import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuantumCompanion } from '../components/learning/quantum-companion';

vi.mock('next/navigation', () => ({
  usePathname: () => '/app/lessons/lesson-102-1',
}));

describe('QuantumCompanion widget', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline test')));
  });

  it('opens from the floating action and answers with local course context', async () => {
    render(<QuantumCompanion />);

    fireEvent.click(await screen.findByRole('button', { name: /open quantum learning companion/i }));
    expect(await screen.findByRole('dialog', { name: /Qubit · Quantum Companion/i })).toBeInTheDocument();

    const input = screen.getByLabelText(/ask the quantum learning companion/i);
    fireEvent.change(input, { target: { value: 'What is a qubit?' } });
    fireEvent.click(screen.getByRole('button', { name: /send question/i }));

    expect(await screen.findByText(/direction on a globe/i, {}, { timeout: 1500 })).toBeInTheDocument();
    expect(sessionStorage.getItem('quantum-companion-history-v2')).toContain('What is a qubit?');
  });

  it('supports the keyboard shortcut and focus-mode recovery', async () => {
    render(<QuantumCompanion />);

    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    const dialog = await screen.findByRole('dialog', { name: /Qubit · Quantum Companion/i });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /enter focus mode/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    expect(await screen.findByRole('dialog', { name: /Qubit · Quantum Companion/i })).toBeInTheDocument();
  });
});
