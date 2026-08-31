import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Quantum Learning Studio | AI-Powered Quantum Laboratory',
    template: '%s | Quantum Learning Studio',
  },
  description:
    'An interactive web platform to learn quantum-computing concepts, construct circuits, simulate state transitions, and resolve conceptual errors with an AI Tutor.',
  keywords: [
    'quantum computing education',
    'quantum circuit simulator',
    'Qiskit learning',
    'AI quantum tutor',
    'quantum laboratory',
  ],
  applicationName: 'Quantum Learning Studio',
  openGraph: {
    type: 'website',
    title: 'Quantum Learning Studio',
    description: 'Learn, build, simulate, visualize, and understand quantum circuits.',
    siteName: 'Quantum Learning Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum Learning Studio',
    description: 'An AI-powered interactive quantum learning laboratory.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme') || 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      var size = localStorage.getItem('fontSize') || 'medium';
      document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-text-primary transition-colors duration-fast"
        suppressHydrationWarning
      >
        <ClerkProvider>
          <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-color focus:text-white focus:rounded-medium focus:shadow-md"
          >
          Skip to main content
          </a>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}