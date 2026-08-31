import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main id="main-content" className="page-container flex min-h-[60dvh] items-center justify-center py-12">
      <section className="w-full max-w-lg rounded-large border border-border-color bg-surface p-6 text-center shadow-md" aria-labelledby="not-found-title">
        <Compass className="mx-auto mb-4 text-primary-color" size={40} aria-hidden="true" />
        <p className="font-mono text-body-small font-bold text-primary-color">404</p>
        <h1 id="not-found-title" className="mt-1 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-body-small text-text-secondary">The requested learning resource may have moved or may no longer be available.</p>
        <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-medium bg-primary-color px-5 py-2 font-bold text-white hover:bg-primary-hover">
          Return home
        </Link>
      </section>
    </main>
  );
}
