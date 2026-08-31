import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface UiState {
  theme: Theme;
  fontSize: FontSize;
  screenReaderOptimized: boolean;
  sidebarCollapsed: boolean;
  currentLessonStep: number;
  activeLabTab: 'build' | 'code' | 'run' | 'results' | 'explain';
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setScreenReaderOptimized: (opt: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveLabTab: (tab: 'build' | 'code' | 'run' | 'results' | 'explain') => void;
}

export const useUiStore = create<UiState>((set) => {
  return {
    theme: 'system',
    fontSize: 'medium',
    screenReaderOptimized: false,
    sidebarCollapsed: false,
    currentLessonStep: 0,
    activeLabTab: 'build',

    setTheme: (theme: Theme) => {
      set({ theme });
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
        // Apply class to html tag
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },

    setFontSize: (fontSize: FontSize) => {
      set({ fontSize });
      if (typeof window !== 'undefined') {
        localStorage.setItem('fontSize', fontSize);
        // Apply font scaling classes
        const html = document.documentElement;
        html.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
      }
    },

    setScreenReaderOptimized: (screenReaderOptimized: boolean) => {
      set({ screenReaderOptimized });
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
    setActiveLabTab: (activeLabTab: 'build' | 'code' | 'run' | 'results' | 'explain') => set({ activeLabTab })
  };
});
