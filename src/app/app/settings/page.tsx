'use client';
import { useUser } from '@clerk/nextjs';
import { useTransition } from 'react';
import {
  User,
  Sliders,
  Accessibility,
  CheckCircle,
  Eye,
  Info
} from 'lucide-react';
import { useUiStore } from '@/stores/use-ui-store';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  const displayName =
    user?.fullName ||
    user?.username ||
    'Quantum Learner';

  const emailAddress =
    user?.primaryEmailAddress?.emailAddress ||
    'Email unavailable';
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    screenReaderOptimized,
    setScreenReaderOptimized
  } = useUiStore();

  const [, startTransition] = useTransition();

  const handleThemeChange = (val: 'light' | 'dark' | 'system') => {
    startTransition(() => {
      setTheme(val);
    });
  };

  const handleFontSizeChange = (val: 'small' | 'medium' | 'large') => {
    startTransition(() => {
      setFontSize(val);
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account & Studio Settings</h1>
        <p className="text-body-small text-text-secondary">Customize your IDE panels, theme settings, and screen reader preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Settings divisions */}
        <div className="lg:col-span-2 space-y-6">

          {/* User profile card */}
          <div className="bg-surface border border-border-color rounded-large p-5 space-y-4">
            <h3 className="font-bold text-body-large flex items-center gap-2">
              <User className="text-primary-color" size={20} /> User Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-small">
              <div className="space-y-1">
                <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Full Name</span>
                <input
                  type="text"
                  value={isLoaded ? displayName : 'Loading...'}
                  className="block w-full px-3 py-2 border border-border-color rounded-medium bg-background text-text-primary"
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Email Address</span>
                <input
                  type="email"
                  value={isLoaded ? emailAddress : 'Loading...'}
                  className="block w-full px-3 py-2 border border-border-color rounded-medium bg-background text-text-primary"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Theme & Display styles */}
          <div className="bg-surface border border-border-color rounded-large p-5 space-y-4">
            <h3 className="font-bold text-body-large flex items-center gap-2">
              <Sliders className="text-primary-color" size={20} /> Theme & Display Options
            </h3>

            <div className="space-y-4 text-body-small">
              {/* Color Scheme */}
              <div className="space-y-2">
                <span className="font-semibold block text-text-secondary">Active Color Theme</span>
                <div className="flex gap-2 max-w-sm">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`flex-1 py-1.5 px-3 border rounded-medium text-caption font-bold capitalize transition-colors ${theme === t
                        ? 'border-primary-color bg-primary-color/5 text-primary-color font-bold shadow-xs'
                        : 'border-border-color bg-background text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font scaling */}
              <div className="space-y-2">
                <span className="font-semibold block text-text-secondary">Text Scaling (Font size)</span>
                <div className="flex gap-2 max-w-sm">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleFontSizeChange(s)}
                      className={`flex-1 py-1.5 px-3 border rounded-medium text-caption font-bold capitalize transition-colors ${fontSize === s
                        ? 'border-primary-color bg-primary-color/5 text-primary-color font-bold shadow-xs'
                        : 'border-border-color bg-background text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="bg-surface border border-border-color rounded-large p-5 space-y-4">
            <h3 className="font-bold text-body-large flex items-center gap-2">
              <Accessibility className="text-primary-color" size={20} /> Accessibility Overrides
            </h3>

            <div className="space-y-4 text-body-small">
              {/* Screen Reader Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  id="screen-reader"
                  type="checkbox"
                  checked={screenReaderOptimized}
                  onChange={(e) => setScreenReaderOptimized(e.target.checked)}
                  className="mt-1 h-4 w-4 border border-border-color rounded bg-background text-primary-color"
                />
                <div className="space-y-1">
                  <label htmlFor="screen-reader" className="font-semibold block text-text-primary">
                    Screen Reader Optimized Layout
                  </label>
                  <p className="text-caption text-text-secondary leading-relaxed">
                    This adds descriptive audio prefix cues and disables high-frequency canvas notifications to assist screen reader navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Status info */}
        <div className="space-y-6">
          <div className="p-6 rounded-large bg-surface border border-border-color shadow-xs space-y-4">
            <h4 className="font-bold text-body-large flex items-center gap-2">
              <Eye className="text-primary-color" size={20} /> System Status
            </h4>

            <div className="space-y-3 text-body-small">
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">App Version</span>
                <span className="font-mono text-caption text-text-primary">v0.1.0-alpha</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Simulation Engine</span>
                <span className="text-success-color font-semibold flex items-center gap-1">
                  <CheckCircle size={14} /> Connected (Ideal)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">AI Tutor Endpoint</span>
                <span className="text-success-color font-semibold flex items-center gap-1">
                  <CheckCircle size={14} /> Synced
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-large bg-primary-color/5 border border-primary-color/20 flex gap-3 text-caption text-text-secondary">
            <Info className="text-primary-color shrink-0 h-5 w-5 mt-0.5" />
            <p className="leading-relaxed">
              Theme configurations and font scales are stored locally in localStorage. Synchronized settings will be pushed to server databases in future releases.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
