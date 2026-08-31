import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '../stores/use-ui-store';

describe('Theme Swapper Store', () => {
  beforeEach(() => {
    // Clear localStorage mock
    localStorage.clear();
    document.documentElement.className = '';
    useUiStore.setState({ theme: 'system' });
  });

  it('initializes with default system theme', () => {
    const state = useUiStore.getState();
    expect(state.theme).toBe('system');
  });

  it('updates state and localStorage when setTheme is triggered', () => {
    const state = useUiStore.getState();
    
    state.setTheme('dark');
    
    // Check that state updated
    expect(useUiStore.getState().theme).toBe('dark');
    
    // Check that class list updated
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Check that localStorage persists
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('removes dark class when theme is switched back to light', () => {
    const state = useUiStore.getState();
    
    state.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    state.setTheme('light');
    
    expect(useUiStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
