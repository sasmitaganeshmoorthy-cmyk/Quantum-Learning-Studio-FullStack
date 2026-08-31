'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';

type HeroAccent = 'cyan' | 'violet' | 'amber';

interface InteractivePageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  accent?: HeroAccent;
  actions?: ReactNode;
  metrics?: ReactNode;
  compact?: boolean;
}

export function InteractivePageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  accent = 'cyan',
  actions,
  metrics,
  compact = false,
}: InteractivePageHeroProps) {
  const frameRef = useRef<HTMLElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updatePointer = (clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame) return;

    const bounds = frame.getBoundingClientRect();
    const normalizedX = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
    const normalizedY = Math.min(1, Math.max(0, (clientY - bounds.top) / bounds.height));

    frame.style.setProperty('--app-pointer-x', `${normalizedX * 100}%`);
    frame.style.setProperty('--app-pointer-y', `${normalizedY * 100}%`);
    frame.style.setProperty('--app-parallax-x', `${(normalizedX - 0.5) * -18}px`);
    frame.style.setProperty('--app-parallax-y', `${(normalizedY - 0.5) * -12}px`);
    frame.style.setProperty('--app-tilt-x', `${(0.5 - normalizedY) * 2.5}deg`);
    frame.style.setProperty('--app-tilt-y', `${(normalizedX - 0.5) * 3.5}deg`);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => updatePointer(event.clientX, event.clientY));
  };

  const handlePointerLeave = () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    const frame = frameRef.current;
    frame?.style.setProperty('--app-pointer-x', '72%');
    frame?.style.setProperty('--app-pointer-y', '42%');
    frame?.style.setProperty('--app-parallax-x', '0px');
    frame?.style.setProperty('--app-parallax-y', '0px');
    frame?.style.setProperty('--app-tilt-x', '0deg');
    frame?.style.setProperty('--app-tilt-y', '0deg');
  };

  return (
    <section
      ref={frameRef}
      className={`app-cinematic-hero app-cinematic-hero--${accent}${compact ? ' app-cinematic-hero--compact' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-labelledby={`${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`}
    >
      <div className="app-cinematic-hero__image" aria-hidden="true">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 82vw, 1200px"
          className="object-cover"
        />
      </div>
      <span className="sr-only">{imageAlt}</span>
      <div className="app-cinematic-hero__scrim" aria-hidden="true" />
      <div className="app-cinematic-hero__grid" aria-hidden="true" />
      <div className="app-cinematic-hero__light" aria-hidden="true" />

      <div className="app-cinematic-hero__content">
        <span className="app-cinematic-hero__eyebrow">
          <span aria-hidden="true" />
          {eyebrow}
        </span>
        <h1 id={`${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`}>{title}</h1>
        <p>{description}</p>
        {actions && <div className="app-cinematic-hero__actions">{actions}</div>}
      </div>

      {metrics && <div className="app-cinematic-hero__metrics">{metrics}</div>}
    </section>
  );
}
