'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Atom,
  BrainCircuit,
  Code2,
  Compass,
  Cpu,
  Database,
  GraduationCap,
  Laptop,
  Moon,
  MousePointer2,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

import { useUiStore } from '@/stores/use-ui-store';

const codeSnippets = {
  qiskit: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()`,
  qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`,
  cirq: `import cirq
q = cirq.LineQubit.range(2)
circuit = cirq.Circuit(
    cirq.H(q[0]),
    cirq.CNOT(q[0], q[1]),
    cirq.measure(*q, key='m')
)`,
};

const featureCards = [
  {
    icon: Sparkles,
    eyebrow: 'Explainable AI',
    title: 'Concept-level diagnostics',
    description: 'Understand why a circuit fails physically, not only where the syntax is wrong.',
  },
  {
    icon: Compass,
    eyebrow: 'Why Mode',
    title: 'Gate-by-gate reasoning',
    description: 'Travel through the circuit timeline and inspect amplitudes, probabilities and state changes.',
  },
  {
    icon: GraduationCap,
    eyebrow: 'Adaptive learning',
    title: 'A path that learns with you',
    description: 'Mastery signals connect lessons, challenges and AI recommendations into one learning loop.',
  },
];

export default function Home() {
  const { theme, setTheme } = useUiStore();
  const heroRef = useRef<HTMLElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'qiskit' | 'qasm' | 'cirq'>('qiskit');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setCurrentStep((step) => (step + 1) % 4), 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
  }, []);

  const moveHero = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      target.style.setProperty('--pointer-x', `${x * 100}%`);
      target.style.setProperty('--pointer-y', `${y * 100}%`);
      target.style.setProperty('--parallax-x', `${(x - 0.5) * -24}px`);
      target.style.setProperty('--parallax-y', `${(y - 0.5) * -18}px`);
      target.style.setProperty('--panel-rotate-x', `${(0.5 - y) * 7}deg`);
      target.style.setProperty('--panel-rotate-y', `${(x - 0.5) * 9}deg`);
    });
  };

  const resetHero = () => {
    const target = heroRef.current;
    if (!target) return;
    target.style.setProperty('--pointer-x', '62%');
    target.style.setProperty('--pointer-y', '42%');
    target.style.setProperty('--parallax-x', '0px');
    target.style.setProperty('--parallax-y', '0px');
    target.style.setProperty('--panel-rotate-x', '0deg');
    target.style.setProperty('--panel-rotate-y', '0deg');
  };

  const tiltCard = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 8}deg`);
    card.style.setProperty('--shine-x', `${x * 100}%`);
    card.style.setProperty('--shine-y', `${y * 100}%`);
  };

  const resetCard = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div className="quantum-landing min-h-screen bg-background text-text-primary">
      <header className="quantum-nav fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Quantum Learning Studio home">
            <span className="quantum-logo flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
              <Atom className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="hidden truncate text-base font-black tracking-tight text-white sm:inline">
              Quantum Learning Studio
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            <a href="#experience" className="quantum-nav-link">Experience</a>
            <a href="#lab-preview" className="quantum-nav-link">Quantum Lab</a>
            <a href="#frameworks" className="quantum-nav-link">Frameworks</a>
            <Link href="/auth/login" className="quantum-nav-link">Sign in</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="quantum-icon-button"
              aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/onboarding" className="quantum-nav-cta">
              Begin journey <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section
          ref={heroRef}
          className="quantum-hero"
          onPointerMove={moveHero}
          onPointerLeave={resetHero}
          aria-labelledby="hero-title"
        >
          <div className="quantum-hero-image" aria-hidden="true">
            <Image src="/images/quantum/quantum-processor.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[64%_center]" />
          </div>
          <div className="quantum-hero-scrim" aria-hidden="true" />
          <div className="quantum-grid" aria-hidden="true" />
          <div className="quantum-cursor-light" aria-hidden="true" />

          <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1440px] items-center gap-12 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-20">
            <div className="max-w-3xl space-y-7">
              <div className="quantum-kicker"><span className="quantum-kicker-dot" />AI-powered quantum learning environment</div>
              <h1 id="hero-title" className="quantum-display">See quantum.<span>Build the impossible.</span></h1>
              <p className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Learn complex quantum ideas inside a living laboratory. Build circuits, watch states evolve and ask an AI tutor that understands every gate in your workspace.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="quantum-primary-button">Start learning <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link href="/app/lab" className="quantum-secondary-button"><Play size={17} aria-hidden="true" /> Open quantum lab</Link>
              </div>
              <div className="grid max-w-2xl grid-cols-3 gap-2 border-t border-white/15 pt-6 sm:gap-5">
                {[
                  ['03', 'Frameworks'],
                  ['Live', 'State tracking'],
                  ['AI', 'Concept tutor'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <div className="text-lg font-black text-cyan-300 sm:text-2xl">{value}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quantum-state-panel" aria-label="Interactive Bell-state preview">
              <div className="quantum-panel-topline">
                <span>Live quantum state</span>
                <span className="quantum-live"><i /> Simulator online</span>
              </div>
              <div className="quantum-orbit-stage" aria-hidden="true">
                <span className="quantum-orbit quantum-orbit-one" />
                <span className="quantum-orbit quantum-orbit-two" />
                <span className="quantum-orbit quantum-orbit-three" />
                <span className="quantum-state-core">ψ</span>
                <span className="quantum-particle particle-one" />
                <span className="quantum-particle particle-two" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>Bell state sequence</span><span>{currentStep + 1}/4</span>
                </div>
                <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                  {['|00⟩', 'H', 'CNOT', 'M'].map((step, index) => (
                    <span key={step} className={`quantum-step ${index <= currentStep ? 'is-active' : ''}`}>{step}</span>
                  ))}
                </div>
                <div className="quantum-equation" aria-live="polite">
                  {currentStep < 2 ? '|ψ⟩ = α|0⟩ + β|1⟩' : '|Φ+⟩ = (|00⟩ + |11⟩) / √2'}
                </div>
              </div>
              <div className="quantum-pointer-hint"><MousePointer2 size={15} aria-hidden="true" /> Move your cursor to explore depth</div>
            </div>
          </div>
          <a className="quantum-scroll-cue" href="#experience" aria-label="Scroll to the experience section"><span /> Explore</a>
        </section>

        <section id="experience" className="quantum-section quantum-section-dark">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="quantum-section-heading">
              <div><p className="quantum-eyebrow">An interactive learning loop</p><h2>From abstract theory to something you can see.</h2></div>
              <p>Every lesson connects explanation, circuit design, simulation and feedback—without sending learners across disconnected tools.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div id="lab-preview" className="quantum-image-card quantum-tilt-card min-h-[520px]" onPointerMove={tiltCard} onPointerLeave={resetCard}>
                <Image src="/images/quantum/quantum-torus.jpg" alt="Futuristic blue quantum torus visualization inside a processor" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                <div className="quantum-image-overlay" />
                <div className="quantum-card-content">
                  <span className="quantum-card-number">01</span>
                  <div>
                    <div className="quantum-card-icon"><BrainCircuit /></div>
                    <p className="quantum-eyebrow">Quantum Lab</p>
                    <h3>Manipulate the state, then understand the outcome.</h3>
                    <p>Drag gates into place, run the circuit and inspect probability changes in real time.</p>
                    <Link href="/app/lab" className="quantum-text-link">Enter the lab <ArrowRight size={17} /></Link>
                  </div>
                </div>
              </div>
              <div className="quantum-image-card quantum-tilt-card min-h-[520px]" onPointerMove={tiltCard} onPointerLeave={resetCard}>
                <Image src="/images/quantum/quantum-core.jpg" alt="Glowing quantum computing core connected to a digital network" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                <div className="quantum-image-overlay" />
                <div className="quantum-card-content">
                  <span className="quantum-card-number">02</span>
                  <div>
                    <div className="quantum-card-icon"><Database /></div>
                    <p className="quantum-eyebrow">Framework-neutral</p>
                    <h3>One circuit. Multiple quantum ecosystems.</h3>
                    <p>Move between Qiskit, Cirq, PennyLane and OpenQASM while keeping the underlying logic visible.</p>
                    <a href="#frameworks" className="quantum-text-link">Compare frameworks <ArrowRight size={17} /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="quantum-section bg-background">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl"><p className="quantum-eyebrow text-primary-color">Built for understanding</p><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Intelligence at every step.</h2></div>
            <div className="grid gap-5 md:grid-cols-3">
              {featureCards.map(({ icon: Icon, eyebrow, title, description }, index) => (
                <article key={title} className="quantum-feature-card">
                  <div className="flex items-start justify-between gap-4"><span className="quantum-feature-icon"><Icon aria-hidden="true" /></span><span className="font-mono text-xs text-text-secondary">0{index + 1}</span></div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-color">{eyebrow}</p>
                  <h3>{title}</h3><p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="frameworks" className="quantum-section quantum-code-section">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
            <div className="space-y-6">
              <p className="quantum-eyebrow">Visual ↔ code synchronization</p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Learn the idea once. Express it everywhere.</h2>
              <p className="max-w-xl leading-7 text-slate-300">Build visually, then inspect production-style code. Framework switching reveals the shared quantum logic beneath different syntax.</p>
              <div className="flex flex-wrap gap-2">{['Qiskit', 'Cirq', 'PennyLane', 'OpenQASM'].map((framework) => <span key={framework} className="quantum-framework-pill">{framework}</span>)}</div>
              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300">
                <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-cyan-300" /> Explainable output</span>
                <span className="flex items-center gap-2"><Cpu size={17} className="text-cyan-300" /> Simulator ready</span>
              </div>
            </div>
            <div className="quantum-code-window">
              <div className="quantum-window-bar"><div className="flex gap-2" aria-hidden="true"><i /><i /><i /></div><span>bell-state.workspace</span><Code2 size={16} aria-hidden="true" /></div>
              <div className="quantum-code-tabs" role="tablist" aria-label="Quantum code framework">
                {(['qiskit', 'cirq', 'qasm'] as const).map((tab) => (
                  <button key={tab} type="button" role="tab" aria-selected={activeCodeTab === tab} onClick={() => setActiveCodeTab(tab)} className={activeCodeTab === tab ? 'is-active' : ''}>
                    {tab === 'qasm' ? 'OpenQASM' : tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <pre className="quantum-code-block"><code>{codeSnippets[activeCodeTab]}</code></pre>
              <div className="quantum-code-status"><span><i /> Circuit valid</span><span>Depth 2 · 2 qubits</span></div>
            </div>
          </div>
        </section>

        <section className="border-t border-border-color bg-surface py-10">
          <div className="mx-auto grid max-w-[1440px] gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              [ShieldCheck, 'WCAG 2.1 AA', 'Keyboard and screen-reader ready'],
              [Laptop, 'Responsive by design', '320px mobile to 1440px displays'],
              [Atom, 'Motion with restraint', 'Reduced-motion fallback included'],
            ].map(([Icon, title, description]) => {
              const StatusIcon = Icon as typeof ShieldCheck;
              return <div key={title as string} className="flex items-center gap-4 rounded-2xl border border-border-color bg-background p-4"><StatusIcon className="h-5 w-5 shrink-0 text-primary-color" aria-hidden="true" /><div><strong className="block text-sm">{title as string}</strong><span className="text-xs text-text-secondary">{description as string}</span></div></div>;
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#02060d] py-8 text-slate-400">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-xs sm:px-6 md:flex-row lg:px-8">
          <span>© 2026 Quantum Learning Studio</span>
          <div className="flex flex-wrap justify-center gap-5"><a href="#" className="hover:text-white">Privacy</a><a href="#" className="hover:text-white">Terms</a><a href="#" className="hover:text-white">Accessibility</a></div>
        </div>
      </footer>
    </div>
  );
}
