'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Atom,
  Trophy,
  LineChart,
  Folder,
  Settings,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
  Flame,
} from 'lucide-react';
import { useUiStore } from '@/stores/use-ui-store';
import {
  getGamificationProfile,
} from '@/lib/api/gamification-client';

import type {
  LearnerGamification,
} from '@/lib/api/gamification-client';

interface NavShellProps {
  children: React.ReactNode;
  userRole?: 'student' | 'instructor';
}

export function NavShell({ children, userRole = 'student' }: NavShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    theme,
    setTheme,
    sidebarCollapsed,
    toggleSidebar
  } = useUiStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<'student' | 'instructor'>(userRole);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [gamification, setGamification] =
  useState<LearnerGamification | null>(null);

const [gamificationLoading, setGamificationLoading] =
  useState(true);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [mobileMenuOpen]);
    useEffect(() => {
    let cancelled = false;

    async function loadGamification() {
      try {
        const data = await getGamificationProfile();

        if (!cancelled) {
          setGamification(data);
        }
      } catch (error) {
        console.error(
          'Navigation gamification loading failed:',
          error
        );
      } finally {
        if (!cancelled) {
          setGamificationLoading(false);
        }
      }
    }

    void loadGamification();

    return () => {
      cancelled = true;
    };
  }, []);

  const studentLinks = [
    { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/catalog', label: 'Courses Catalog', icon: BookOpen },
    { href: '/app/lab', label: 'Quantum Lab', icon: Atom },
    { href: '/app/challenges', label: 'Challenges', icon: Trophy },
    { href: '/app/progress', label: 'Mastery & Progress', icon: LineChart },
    { href: '/app/projects', label: 'My Projects', icon: Folder },
    { href: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const instructorLinks = [
    { href: '/instructor/dashboard', label: 'Instructor Home', icon: LayoutDashboard },
    { href: '/instructor/classrooms', label: 'Classrooms', icon: GraduationCap },
    { href: '/app/lab', label: 'Quantum Lab', icon: Atom },
    { href: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const currentLinks = role === 'instructor' ? instructorLinks : studentLinks;

  const handleRoleToggle = () => {
    const nextRole = role === 'student' ? 'instructor' : 'student';
    setRole(nextRole);
    if (nextRole === 'instructor') {
      router.push('/instructor/dashboard');
    } else {
      router.push('/app/dashboard');
    }
  };

  const handleThemeChange = (nextTheme: 'light' | 'dark' | 'system') => {
    setTheme(nextTheme);
  };

  const isWorkspacePage =
    pathname.startsWith('/app/lessons/') ||
    pathname.startsWith('/app/lab') ||
    pathname.startsWith('/app/challenges/');

  return (
    <div className="app-viewport flex min-w-0 overflow-hidden bg-background text-text-primary">
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-border-color bg-surface transition-all duration-standard ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header/Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border-color">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className={`flex items-center justify-center shrink-0 overflow-hidden ${sidebarCollapsed ? 'h-10 w-10' : 'h-10 w-44'}`}>
              <Image
                src="/quantum-learning-logo.png"
                alt="Quantum Learning Studio"
                width={320}
                height={80}
                priority
                className="h-10 w-auto max-w-none object-contain"
              />
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="touch-target flex items-center justify-center rounded-medium hover:bg-surface-hover text-text-secondary"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Stats Summary (Desktop - Compact when collapsed) */}
        {!sidebarCollapsed && role === 'student' && (
          <div className="p-4 mx-3 my-4 rounded-medium bg-background border border-border-color/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-body-small text-text-secondary font-medium flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-warning-color animate-bounce" /> Streak
              </span>
             <span className="font-bold text-warning-color">
  {gamificationLoading
    ? '—'
    : `${gamification?.streak ?? 0} ${
        gamification?.streak === 1 ? 'Day' : 'Days'
      }`}
</span>
            </div>
            <div className="w-full bg-border-color h-2 rounded-pill overflow-hidden">
            <div
  className="bg-warning-color h-full"
  style={{
    width: `${Math.min(
      ((gamification?.xp ?? 0) % 250) / 250 * 100,
      100
    )}%`,
  }}
/>
            </div>
            <div className="flex items-center justify-between text-body-small">
              <span className="text-text-secondary">XP Gained</span>
              <span className="font-semibold text-primary-color">
  {gamificationLoading
    ? '—'
    : `${gamification?.xp ?? 0} XP`}
</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {currentLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-medium font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-color text-white'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
                title={link.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && <span className="text-body-small">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-color space-y-3">
          {/* Switch Role Button */}
          {!sidebarCollapsed ? (
            <button
              onClick={handleRoleToggle}
              className="w-full min-h-11 flex items-center justify-center gap-2 py-2 px-3 border border-border-color rounded-medium text-body-small text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <GraduationCap size={16} />
              <span>Switch to {role === 'student' ? 'Instructor' : 'Learner'}</span>
            </button>
          ) : (
            <button
              onClick={handleRoleToggle}
              className="w-full min-h-11 flex items-center justify-center p-2 border border-border-color rounded-medium text-text-secondary hover:bg-surface-hover"
              title={`Switch to ${role === 'student' ? 'Instructor' : 'Learner'}`}
            >
              <GraduationCap size={18} />
            </button>
          )}

          {/* Theme Switcher */}
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between rounded-medium border border-border-color p-1 bg-surface-hover">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-1.5 rounded-small flex-1 flex justify-center ${
                  theme === 'light' ? 'bg-surface shadow-sm text-primary-color' : 'text-text-secondary'
                }`}
                title="Light Theme"
                aria-label="Use light theme"
                aria-pressed={theme === 'light'}
              >
                <Sun size={16} />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-1.5 rounded-small flex-1 flex justify-center ${
                  theme === 'dark' ? 'bg-surface shadow-sm text-primary-color' : 'text-text-secondary'
                }`}
                title="Dark Theme"
                aria-label="Use dark theme"
                aria-pressed={theme === 'dark'}
              >
                <Moon size={16} />
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`p-1.5 rounded-small flex-1 flex justify-center ${
                  theme === 'system' ? 'bg-surface shadow-sm text-primary-color' : 'text-text-secondary'
                }`}
                title="System Theme"
                aria-label="Use system theme"
                aria-pressed={theme === 'system'}
              >
                <Monitor size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-center p-2 rounded-medium hover:bg-surface-hover text-text-secondary"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Logout */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-medium text-body-small text-error-color hover:bg-red-50 dark:hover:bg-red-950/20 font-medium"
          >
            <LogOut size={20} className="shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Navbar */}
        <header className="flex md:hidden min-h-16 items-center justify-between border-b border-border-color bg-surface px-3 sm:px-4 z-20">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target flex shrink-0 items-center justify-center rounded-medium hover:bg-surface-hover text-text-primary"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="truncate font-bold text-primary-color leading-tight text-sm sm:text-base">Quantum Studio</span>
          </div>

          {/* Top Bar Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-warning-color text-body-small font-bold">
              <Flame size={16} />
              <span>5</span>
            </div>
            <Link
              href="/app/settings"
              className="touch-target flex items-center justify-center text-text-secondary hover:text-text-primary rounded-medium"
              aria-label="Settings"
            >
              <Settings size={18} />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex" role="presentation">
            {/* Background Backdrop */}
            <button
              type="button"
              className="fixed inset-0 min-h-0 w-full cursor-default bg-slate-950/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              tabIndex={-1}
            />
            {/* Drawer Content */}
            <div
              ref={drawerRef}
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              tabIndex={-1}
              className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-border-color bg-surface p-4 shadow-2xl animate-slide-in"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border-color">
                <span className="font-sans font-bold text-lg text-primary-color">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="touch-target flex items-center justify-center hover:bg-surface-hover rounded-medium text-text-primary"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links inside Drawer */}
              <nav className="flex-1 space-y-1.5 py-4 overflow-y-auto">
                {currentLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-medium font-medium ${
                        isActive
                          ? 'bg-primary-color text-white'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={18} />
                      <span className="text-body-small">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer controls */}
              <div className="pt-4 border-t border-border-color space-y-3">
                <button
                  onClick={() => {
                    handleRoleToggle();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-11 flex items-center justify-center gap-2 py-2 px-3 border border-border-color rounded-medium text-body-small text-text-secondary hover:bg-surface-hover"
                >
                  <GraduationCap size={16} />
                  <span>Switch to {role === 'student' ? 'Instructor' : 'Learner'}</span>
                </button>
                <div className="flex items-center justify-between rounded-medium border border-border-color p-1 bg-surface-hover">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-1 flex-1 flex justify-center rounded-small ${
                      theme === 'light' ? 'bg-surface shadow-sm text-primary-color' : 'text-text-secondary'
                    }`}
                  >
                    <Sun size={16} />
                    <span className="sr-only">Use light theme</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-1 flex-1 flex justify-center rounded-small ${
                      theme === 'dark' ? 'bg-surface shadow-sm text-primary-color' : 'text-text-secondary'
                    }`}
                  >
                    <Moon size={16} />
                    <span className="sr-only">Use dark theme</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Central Content Area (where individual pages are rendered) */}
        <main
          id="main-content"
          className={`min-h-0 min-w-0 flex-1 overscroll-contain ${
            isWorkspacePage ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Mobile Bottom Tab Bar (Fast tabs for the most critical actions) */}
        {role === 'student' && (
          <nav aria-label="Primary mobile navigation" className="safe-bottom md:hidden min-h-[72px] border-t border-border-color bg-surface flex items-center justify-around px-1 z-20">
            <Link
              href="/app/dashboard"
              aria-current={pathname === '/app/dashboard' ? 'page' : undefined}
              className={`min-h-14 flex flex-col items-center justify-center gap-1 text-center px-1 flex-1 ${
                pathname === '/app/dashboard' ? 'text-primary-color' : 'text-text-secondary'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-semibold">Home</span>
            </Link>
            <Link
              href="/app/catalog"
              aria-current={pathname.startsWith('/app/catalog') ? 'page' : undefined}
              className={`min-h-14 flex flex-col items-center justify-center gap-1 text-center px-1 flex-1 ${
                pathname.startsWith('/app/catalog') ? 'text-primary-color' : 'text-text-secondary'
              }`}
            >
              <BookOpen size={20} />
              <span className="text-[10px] font-semibold">Catalog</span>
            </Link>
            <Link
              href="/app/lab"
              aria-current={pathname.startsWith('/app/lab') ? 'page' : undefined}
              className={`min-h-14 flex flex-col items-center justify-center gap-1 text-center px-1 flex-1 ${
                pathname.startsWith('/app/lab') ? 'text-primary-color' : 'text-text-secondary'
              }`}
            >
              <Atom size={20} className="animate-spin-slow" />
              <span className="text-[10px] font-semibold">Lab</span>
            </Link>
            <Link
              href="/app/challenges"
              aria-current={pathname.startsWith('/app/challenges') ? 'page' : undefined}
              className={`min-h-14 flex flex-col items-center justify-center gap-1 text-center px-1 flex-1 ${
                pathname.startsWith('/app/challenges') ? 'text-primary-color' : 'text-text-secondary'
              }`}
            >
              <Trophy size={20} />
              <span className="text-[10px] font-semibold">Trophy</span>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
