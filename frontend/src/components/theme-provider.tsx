'use client';

import { useEffect, ReactNode } from 'react';
import { useUiStore } from '@/stores/use-ui-store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { setTheme, setFontSize } = useUiStore();

  useEffect(() => {
    // Read and enforce current settings on mount
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme as 'light' | 'dark' | 'system');

    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    setFontSize(savedFontSize as 'small' | 'medium' | 'large');

    // Listener for system updates
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemChange = () => {
      if (useUiStore.getState().theme === 'system') {
        const isDark = mediaQuery.matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, [setTheme, setFontSize]);

  return <>{children}</>;
}
