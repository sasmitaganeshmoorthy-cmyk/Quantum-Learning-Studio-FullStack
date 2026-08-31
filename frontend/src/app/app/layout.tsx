'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { NavShell } from '@/components/layout/nav-shell';

const QuantumCompanion = dynamic(
  () => import('@/components/learning/quantum-companion').then((module) => module.QuantumCompanion),
  { ssr: false, loading: () => null },
);

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <NavShell userRole="student">
      {children}
      <QuantumCompanion />
    </NavShell>
  );
}
