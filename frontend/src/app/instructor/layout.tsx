'use client';

import { ReactNode } from 'react';
import { NavShell } from '@/components/layout/nav-shell';

export default function InstructorLayout({ children }: { children: ReactNode }) {
  return <NavShell userRole="instructor">{children}</NavShell>;
}
