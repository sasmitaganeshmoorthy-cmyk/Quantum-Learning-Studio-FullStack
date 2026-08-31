'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="page-container flex min-h-[60dvh] items-center justify-center py-12">
      <section className="w-full max-w-lg rounded-large border border-error-color/30 bg-surface p-6 text-center shadow-md" aria-labelledby="error-title">
        <AlertTriangle className="mx-auto mb-4 text-error-color" size={36} aria-hidden="true" />
        <h1 id="error-title" className="text-2xl font-bold">This page could not be loaded</h1>
        <p className="mt-2 text-body-small text-text-secondary">Retry the request. If the problem continues, return to your dashboard.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-medium bg-primary-color px-4 py-2 font-bold text-white hover:bg-primary-hover">
            <RotateCcw size={16} aria-hidden="true" /> Retry
          </button>
          <Link href="/app/dashboard" className="inline-flex items-center justify-center rounded-medium border border-border-color px-4 py-2 font-bold hover:bg-surface-hover">
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
