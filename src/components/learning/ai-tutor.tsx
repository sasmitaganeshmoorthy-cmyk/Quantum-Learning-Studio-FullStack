'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { mockApi } from '@/lib/api/mock-client';
import { AIMessage } from '@/lib/api/types';

interface AiTutorProps {
  contextType: 'lesson' | 'circuit' | 'challenge';
  contextId: string;
  onRecommendationClick?: () => void;
}

export function AiTutor({ contextType, contextId }: AiTutorProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: `Hello! I am your AI Tutor. I am synced with your active ${contextType}: "${contextId.replace('-', ' ').toUpperCase()}". Ask me to explain concepts, show mathematical formulations, or inspect your circuit for mistakes!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);
  const messageSequenceRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    messageSequenceRef.current += 1;
    const userMsg: AIMessage = {
      id: `user-${messageSequenceRef.current}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    setStreamingText('');
    abortControllerRef.current = false;

    try {
      const responseText = await mockApi.askAiTutor(
        text,
        { type: contextType, id: contextId },
        (chunk) => {
          if (!abortControllerRef.current) {
            setStreamingText(chunk);
          }
        }
      );

      if (!abortControllerRef.current) {
        messageSequenceRef.current += 1;
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${messageSequenceRef.current}`,
            sender: 'ai',
            content: useUiStore.getState().screenReaderOptimized 
              ? 'AI: ' + responseText
              : responseText,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  };

  const handleStop = () => {
    abortControllerRef.current = true;
    setLoading(false);
    if (streamingText) {
      messageSequenceRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-stopped-${messageSequenceRef.current}`,
          sender: 'ai',
          content: `${streamingText} [Generation stopped by user]`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
    setStreamingText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestionChips = [
    { label: 'Explain this gate', icon: Sparkles },
    { label: 'Find my mistake', icon: XCircle },
    { label: 'Show the mathematics', icon: MessageSquare }
  ];

  return (
    <section className="flex min-w-0 flex-col h-full bg-surface border-l border-border-color" aria-label="Contextual AI tutor">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-border-color flex items-center justify-between bg-surface-hover/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-primary-color h-5 w-5" />
          <span className="font-bold text-body-small">Contextual AI Tutor</span>
        </div>
        <span className="text-[10px] bg-primary-color/10 text-primary-color px-2.5 py-0.5 rounded-pill font-bold tracking-wide uppercase">
          {contextType} Mode
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4" aria-live="polite" aria-busy={loading}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-large p-3 text-body-small shadow-xs relative group ${
                msg.sender === 'user'
                  ? 'bg-primary-color text-white rounded-br-none'
                  : 'bg-background border border-border-color/50 rounded-bl-none text-text-primary'
              }`}
            >
              {/* Message content */}
              <div className="prose dark:prose-invert max-w-none text-body-small whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Message action controls (Copy / Feedback for AI replies) */}
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1.5 pt-2 sm:absolute sm:-bottom-12 sm:left-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 bg-surface sm:border sm:border-border-color sm:p-1 sm:rounded-medium sm:shadow-xs transition-opacity duration-fast z-10">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="p-1 hover:bg-surface-hover rounded-small text-text-secondary hover:text-text-primary"
                    aria-label="Copy AI response"
                  >
                    {copiedId === msg.id ? <Check size={12} className="text-success-color" /> : <Copy size={12} />}
                  </button>
                  <button className="p-1 hover:bg-surface-hover rounded-small text-text-secondary hover:text-success-color" aria-label="Mark response as helpful">
                    <ThumbsUp size={12} />
                  </button>
                  <button className="p-1 hover:bg-surface-hover rounded-small text-text-secondary hover:text-error-color" aria-label="Mark response as not helpful">
                    <ThumbsDown size={12} />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-text-secondary mt-1 px-1">
              {msg.sender === 'user' ? 'You' : 'AI Assistant'}
            </span>
          </div>
        ))}

        {/* Live Streaming display */}
        {streamingText && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-large p-3 text-body-small bg-background border border-border-color/50 rounded-bl-none text-text-primary shadow-xs">
              <span className="prose dark:prose-invert text-body-small whitespace-pre-wrap leading-relaxed">
                {streamingText}
              </span>
              <span className="inline-block w-1.5 h-3 bg-primary-color ml-1 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-text-secondary">AI streaming...</span>
              <button
                onClick={handleStop}
              className="min-h-11 text-xs font-bold text-error-color hover:underline flex items-center gap-1"
              >
                [Stop Generation]
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !streamingText && (
          <div className="flex items-center gap-2 text-caption text-text-secondary">
            <Loader2 className="animate-spin text-primary-color h-4 w-4" />
            <span>AI Tutor is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-border-color space-y-1 bg-surface-hover/20">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Quick Actions</span>
        <div className="flex flex-wrap gap-1.5">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.label)}
              className="min-h-11 text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-1 bg-surface border border-border-color rounded-pill flex items-center gap-1 hover:border-primary-color/50 transition-colors"
            >
              <chip.icon size={12} className="text-primary-color" />
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="p-3 border-t border-border-color flex items-center gap-2 bg-surface"
      >
        <label htmlFor={`ai-question-${contextId}`} className="sr-only">Ask the AI tutor a question</label>
        <input
          id={`ai-question-${contextId}`}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question..."
          className="min-w-0 flex-1 py-1.5 px-3 border border-border-color rounded-medium bg-background text-body-small"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="touch-target flex shrink-0 items-center justify-center p-2 bg-primary-color text-white rounded-medium hover:bg-primary-hover transition-colors disabled:opacity-30"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Accuracy Warning footer */}
      <div className="p-2 bg-surface-hover border-t border-border-color text-center">
        <span className="text-[9px] text-text-secondary leading-none block">
          AI-generated calculations can contain inaccuracies. Cross-check critical circuits.
        </span>
      </div>
    </section>
  );
}

// Minimal useUiStore mock definition for direct file references
import { useUiStore } from '@/stores/use-ui-store';
