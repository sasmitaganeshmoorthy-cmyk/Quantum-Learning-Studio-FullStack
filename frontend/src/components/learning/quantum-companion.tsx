'use client';

import { FormEvent, KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Bot,
  BrainCircuit,
  Cloud,
  Database,
  EyeOff,
  Lightbulb,
  MessageCircle,
  Minus,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  Trash2,
} from 'lucide-react';
import type { CompanionApiMessage } from '@/lib/api/companion-types';
import {
  deletePersistedCompanionHistory,
  getPersistedCompanionHistory,
  requestCompanionAnswer,
} from '@/lib/api/companion-client';
import {
  type CompanionLevel,
  getCompanionCourseContext,
  isActiveLearningRoute,
} from '@/lib/quantum-companion';

type CompanionMessage = CompanionApiMessage;

const SESSION_HISTORY_KEY = 'quantum-companion-history-v2';
const SESSION_LEVEL_KEY = 'quantum-companion-level-v1';
const SESSION_FOCUS_KEY = 'quantum-companion-focus-v1';
const SESSION_ID_KEY = 'quantum-companion-session-id-v1';
const SESSION_EXTERNAL_KEY = 'quantum-companion-external-ai-v1';
const SESSION_PERSIST_KEY = 'quantum-companion-persist-v1';
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

function isStoredMessage(value: unknown): value is CompanionMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<CompanionMessage>;
  return typeof message.id === 'string'
    && (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && typeof message.timestamp === 'string';
}

function welcomeMessage(routeLabel: string, currentTopic: string): CompanionMessage {
  return {
    id: 'companion-welcome',
    role: 'assistant',
    content: `Hi! I’m Qubit, your quantum learning companion. You are in ${routeLabel}, working on ${currentTopic}. Ask for an explanation, a small hint, a roadmap, resources, or your recommended next step.`,
    timestamp: new Date().toISOString(),
  };
}

function readStoredMessages(routeLabel: string, currentTopic: string): CompanionMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedMessages = JSON.parse(sessionStorage.getItem(SESSION_HISTORY_KEY) ?? '[]') as unknown;
    if (Array.isArray(storedMessages) && storedMessages.every(isStoredMessage) && storedMessages.length > 0) {
      return storedMessages.slice(-40);
    }
  } catch {
    // Invalid session data is safely replaced.
  }
  return [welcomeMessage(routeLabel, currentTopic)];
}

function readStoredLevel(): CompanionLevel {
  if (typeof window === 'undefined') return 'beginner';
  const storedLevel = sessionStorage.getItem(SESSION_LEVEL_KEY);
  return storedLevel === 'intermediate' || storedLevel === 'advanced' ? storedLevel : 'beginner';
}

function readStoredBoolean(key: string): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(key) === 'true';
}

function createSessionId(): string {
  if (typeof window === 'undefined') return 'session-server-placeholder';
  const stored = sessionStorage.getItem(SESSION_ID_KEY);
  if (stored) return stored;
  const randomPart = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const sessionId = `session-${randomPart}`;
  sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

export function QuantumCompanion() {
  const pathname = usePathname();
  const inputId = useId();
  const context = useMemo(() => getCompanionCourseContext(pathname), [pathname]);
  const learningRoute = isActiveLearningRoute(pathname);
  const hideBesideDesktopLessonTutor = '';
  const [open, setOpen] = useState(false);
  const [engaged, setEngaged] = useState(true);
  const [focusMode, setFocusMode] = useState(() => readStoredBoolean(SESSION_FOCUS_KEY));
  const [messages, setMessages] = useState<CompanionMessage[]>(() => readStoredMessages(context.routeLabel, context.currentTopic));
  const [level, setLevel] = useState<CompanionLevel>(readStoredLevel);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [externalConsent, setExternalConsent] = useState(() => readStoredBoolean(SESSION_EXTERNAL_KEY));
  const [persistHistory, setPersistHistory] = useState(() => readStoredBoolean(SESSION_PERSIST_KEY));
  const [sessionId] = useState(createSessionId);
  const [responseStatus, setResponseStatus] = useState('Local privacy-first tutor');
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageSequenceRef = useRef(messages.length);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    if (!persistHistory || historyLoadedRef.current) return;

    let cancelled = false;

    void getPersistedCompanionHistory()
      .then(({ messages: savedMessages }) => {
        if (cancelled) return;

        historyLoadedRef.current = true;

        if (savedMessages.length === 0) return;

        setMessages([
          welcomeMessage(context.routeLabel, context.currentTopic),
          ...savedMessages.slice(-39),
        ]);

        messageSequenceRef.current = savedMessages.length + 1;

        setResponseStatus(
          `Saved history loaded · ${savedMessages.length} messages`
        );
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Saved chat history could not be loaded.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [persistHistory, context.routeLabel, context.currentTopic]);
  useEffect(() => {
    sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_LEVEL_KEY, level);
  }, [level]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_FOCUS_KEY, String(focusMode));
    sessionStorage.setItem(SESSION_EXTERNAL_KEY, String(externalConsent));
    sessionStorage.setItem(SESSION_PERSIST_KEY, String(persistHistory));
  }, [externalConsent, focusMode, persistHistory]);

  useEffect(() => {
    let idleTimer: number | undefined;
    const markActive = () => {
      setEngaged(true);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setEngaged(false), IDLE_TIMEOUT_MS);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setEngaged(false);
        window.clearTimeout(idleTimer);
      } else {
        markActive();
      }
    };
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, markActive, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    markActive();

    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, markActive));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if (!learningRoute) return;
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        setEngaged(true);
        if (focusMode) {
          setFocusMode(false);
          setOpen(true);
        } else {
          setOpen((current) => !current);
        }
      }
      if (event.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [focusMode, learningRoute, open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === 'function') endRef.current.scrollIntoView({ block: 'end' });
  }, [messages, thinking]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || thinking) return;

    messageSequenceRef.current += 1;
    const userMessage: CompanionMessage = {
      id: `companion-user-${messageSequenceRef.current}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const priorMessages = messages.slice(-10);
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setThinking(true);
    setErrorMessage('');
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await requestCompanionAnswer({
        question: text,
        level,
        context,
        history: priorMessages,
        sessionId,
        persistHistory,
        consentToExternalAI: externalConsent,
      }, controller.signal);

      messageSequenceRef.current += 1;
      setMessages((current) => [...current, {
        id: `companion-assistant-${messageSequenceRef.current}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
      }]);
      const sourceLabel = response.source === 'external' ? 'Enhanced AI' : 'Local tutor';
      const persistenceLabel = persistHistory ? (response.persisted ? ' · saved' : ' · not saved') : '';
      setResponseStatus(`${sourceLabel} · ${response.latencyMs} ms${persistenceLabel}`);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setErrorMessage('The response was interrupted. Please try again.');
      }
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
      setThinking(false);
    }
  };

  const stopResponse = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setThinking(false);
    setResponseStatus('Response stopped');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const clearHistory = () => {
    abortControllerRef.current?.abort();
    setMessages([welcomeMessage(context.routeLabel, context.currentTopic)]);
    setThinking(false);
    setErrorMessage('');
    sessionStorage.removeItem(SESSION_HISTORY_KEY);
    if (persistHistory) void deletePersistedCompanionHistory(sessionId);
  };

  if (!learningRoute || !engaged || focusMode) return null;

  if (!open) {
    return (
      <div className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-[80] md:bottom-6 md:right-6 ${hideBesideDesktopLessonTutor}`}>
        <button type="button" onClick={() => setOpen(true)} className="group relative flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-pill bg-primary-color px-3 text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary-hover sm:px-4" aria-label="Open quantum learning companion. Keyboard shortcut Control or Command plus slash." aria-expanded="false" aria-controls="quantum-companion-panel">
          <MessageCircle size={21} aria-hidden="true" />
          <span className="hidden text-body-small font-bold sm:inline">Ask Qubit</span>
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success-color" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const quickActions = [
    { label: 'Explain', icon: Sparkles, prompt: `Explain ${context.currentTopic} at my level` },
    { label: 'Hint', icon: Lightbulb, prompt: 'Give me a small hint for my current challenge' },
    { label: 'Next step', icon: Target, prompt: 'What should I study next based on my progress?' },
    { label: 'Roadmap', icon: BookOpen, prompt: 'Build an industry roadmap for a beginner with 5 hours per week' },
  ];

  return (
    <section id="quantum-companion-panel" role="dialog" aria-modal="false" aria-labelledby="quantum-companion-title" aria-describedby="quantum-companion-privacy" className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-2 right-2 z-[80] flex h-[min(76dvh,42rem)] min-h-[18rem] flex-col overflow-hidden rounded-large border border-border-color bg-surface shadow-2xl sm:left-auto sm:right-4 sm:w-[min(26rem,calc(100vw-2rem))] md:bottom-5 md:right-5 ${hideBesideDesktopLessonTutor}`}>
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-color bg-primary-color px-2.5 py-2 text-white sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-medium bg-white/15 min-[360px]:flex"><BrainCircuit size={20} aria-hidden="true" /></div>
          <div className="min-w-0">
            <h2 id="quantum-companion-title" className="truncate text-body-small font-bold">Qubit · Quantum Companion</h2>
            <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-white/80"><span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" /> {responseStatus}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <button type="button" onClick={clearHistory} className="touch-target flex items-center justify-center rounded-medium text-white hover:bg-white/15" aria-label="Clear companion chat history"><Trash2 size={16} /></button>
          <button type="button" onClick={() => { setOpen(false); setFocusMode(true); }} className="touch-target hidden items-center justify-center rounded-medium text-white hover:bg-white/15 min-[360px]:flex" aria-label="Enter focus mode and hide companion"><EyeOff size={17} /></button>
          <button type="button" onClick={() => setOpen(false)} className="touch-target flex items-center justify-center rounded-medium text-white hover:bg-white/15" aria-label="Minimize quantum companion"><Minus size={18} /></button>
        </div>
      </header>

      <div className="shrink-0 border-b border-border-color bg-surface-hover/40 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-caption font-semibold text-text-secondary">{context.routeLabel}</span>
          <select value={level} onChange={(event) => setLevel(event.target.value as CompanionLevel)} className="min-h-9 rounded-medium border border-border-color bg-surface px-2 text-caption font-semibold capitalize text-text-primary" aria-label="Explanation level">
            <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-text-secondary">
          <label className="inline-flex min-h-7 items-center gap-1.5" title="Allows course context and recent messages to be sent to the configured AI provider."><input type="checkbox" checked={externalConsent} onChange={(event) => setExternalConsent(event.target.checked)} className="h-4 w-4 accent-primary-color" /><Cloud size={13} aria-hidden="true" /> Enhanced AI</label>
          <label className="inline-flex min-h-7 items-center gap-1.5" title="Stores this chat in MongoDB when the database is configured."><input type="checkbox" checked={persistHistory} onChange={(event) => setPersistHistory(event.target.checked)} className="h-4 w-4 accent-primary-color" /><Database size={13} aria-hidden="true" /> Save chat</label>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3" aria-live="polite" aria-busy={thinking}>
        {messages.map((message) => (
          <article key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] rounded-large px-3 py-2.5 text-body-small leading-relaxed shadow-xs sm:max-w-[88%] ${message.role === 'user' ? 'rounded-br-small bg-primary-color text-white' : 'rounded-bl-small border border-border-color/60 bg-background text-text-primary'}`}>
              {message.role === 'assistant' && <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary-color"><Bot size={12} aria-hidden="true" /> Qubit</span>}
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </article>
        ))}
        {thinking && <div className="flex items-center justify-between gap-2 rounded-large rounded-bl-small border border-border-color/60 bg-background px-3 py-2.5 text-caption text-text-secondary"><span className="inline-flex items-center gap-2"><Sparkles className="animate-pulse text-primary-color" size={14} /> Connecting this to your course…</span><button type="button" onClick={stopResponse} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-medium px-2 font-bold text-error-color hover:bg-error-color/10" aria-label="Stop generating response"><Square size={12} fill="currentColor" /> Stop</button></div>}
        {errorMessage && <p role="alert" className="rounded-medium border border-error-color/30 bg-error-color/10 p-2 text-caption text-error-color">{errorMessage}</p>}
        <div ref={endRef} />
      </div>

      <div className="scrollbar-hidden shrink-0 overflow-x-auto border-t border-border-color bg-surface-hover/20 px-3 py-2"><div className="flex min-w-max gap-2">{quickActions.map((action) => <button key={action.label} type="button" onClick={() => void sendMessage(action.prompt)} disabled={thinking} className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-border-color bg-surface px-3 text-caption font-bold text-text-secondary hover:border-primary-color/50 hover:text-text-primary disabled:opacity-50"><action.icon className="text-primary-color" size={14} aria-hidden="true" /> {action.label}</button>)}</div></div>

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border-color bg-surface p-2.5 sm:p-3">
        <label htmlFor={inputId} className="sr-only">Ask the quantum learning companion</label>
        <div className="flex items-end gap-2"><textarea ref={inputRef} id={inputId} value={input} onChange={(event) => setInput(event.target.value.slice(0, 1_500))} onKeyDown={handleInputKeyDown} rows={1} placeholder="Ask about quantum computing…" className="max-h-28 min-h-11 min-w-0 flex-1 resize-y rounded-medium border border-border-color bg-background px-3 py-2 text-body-small text-text-primary" disabled={thinking} /><button type="submit" disabled={thinking || !input.trim()} className="touch-target flex shrink-0 items-center justify-center rounded-medium bg-primary-color text-white hover:bg-primary-hover disabled:opacity-40" aria-label="Send question to quantum companion"><Send size={17} /></button></div>
        <div id="quantum-companion-privacy" className="mt-2 flex items-center justify-between gap-2 text-[10px] text-text-secondary"><span className="inline-flex items-center gap-1"><ShieldCheck size={12} aria-hidden="true" /> External AI is opt-in; local session history remains available.</span><span className="hidden sm:inline">Ctrl/Cmd + /</span></div>
      </form>
    </section>
  );
}
