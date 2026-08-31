'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, Clock, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { mockCourses } from '@/lib/api/mock-client';
import { InteractivePageHero } from '@/components/visual/interactive-page-hero';

export default function CourseCatalog() {
  type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const difficultyOptions: DifficultyFilter[] = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === 'all' || course.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <InteractivePageHero
        eyebrow="Adaptive quantum curriculum"
        title="Choose a pathway. Build intuition by doing."
        description="Move from visual foundations to executable quantum algorithms through connected modules, live experiments, and AI-guided practice."
        imageSrc="/images/quantum/learning-pathway.png"
        imageAlt="A luminous three-dimensional quantum learning pathway made from connected educational nodes"
        accent="violet"
        compact
        actions={
          <>
            <a href="#course-grid" className="app-hero-primary">Explore modules <ArrowRight size={16} /></a>
            <Link href="/app/progress" className="app-hero-secondary"><Sparkles size={16} /> View my pathway</Link>
          </>
        }
        metrics={
          <>
            <div className="app-hero-metric"><strong>{mockCourses.length} paths</strong><span>Available now</span></div>
            <div className="app-hero-metric"><strong>3 levels</strong><span>Adaptive depth</span></div>
          </>
        }
      />

      {/* Search and Filters Layout */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-surface p-4 rounded-large border border-border-color shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-secondary pointer-events-none">
            <Search size={18} />
          </span>
          <input
            aria-label="Search courses"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-medium bg-background text-body-small"
            placeholder="Search concepts, gates or algorithms..."
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-caption font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={14} /> Difficulty:
          </span>
          <div className="flex gap-1.5">
            {difficultyOptions.map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-3 py-1.5 rounded-medium border text-body-small font-semibold capitalize transition-all ${
                  difficultyFilter === level
                    ? 'bg-primary-color border-primary-color text-white'
                    : 'bg-background border-border-color text-text-secondary hover:text-text-primary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div id="course-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-mt-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="app-depth-card app-interactive-card group rounded-large flex flex-col justify-between overflow-hidden"
            >
              <div className="relative h-1.5 overflow-hidden bg-slate-950" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-90 transition-transform duration-500 group-hover:scale-x-110" />
              </div>
              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
                    course.difficulty === 'beginner'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                  }`}>
                    {course.difficulty}
                  </span>
                  
                  {/* Bookmark symbol */}
                  <button className="touch-target flex items-center justify-center text-text-secondary hover:text-primary-color transition-colors" aria-label={`Bookmark ${course.title}`}>
                    <Bookmark size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-text-primary group-hover:text-primary-color transition-colors">
                    <Link href={`/app/courses/${course.id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-body-small text-text-secondary line-clamp-3">
                    {course.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-caption text-text-secondary pt-2">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} /> {course.lessonsCount} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {course.estimatedDuration}
                  </span>
                </div>

                {/* Framework Labels */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {course.frameworks.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-small bg-background border border-border-color text-[10px] font-semibold text-text-secondary">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Progress Footer */}
              <div className="px-6 py-4 bg-surface-hover border-t border-border-color flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-caption font-bold text-text-secondary">
                    <span>Complete</span>
                    <span>{course.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-border-color h-1.5 rounded-pill overflow-hidden">
                    <div
                      className="bg-primary-color h-full transition-all"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/app/courses/${course.id}`}
                  className="px-3 py-1.5 bg-primary-color text-white text-caption font-bold rounded-medium hover:bg-primary-hover transition-colors shrink-0"
                >
                  {course.progressPercent > 0 ? 'Continue' : 'Start'}
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="p-12 text-center rounded-large bg-surface border border-border-color shadow-xs max-w-md mx-auto space-y-4">
          <div className="h-12 w-12 bg-border-color/30 text-text-secondary rounded-pill flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-body-large">No courses found</h3>
            <p className="text-body-small text-text-secondary">Try adjusting your search keywords or difficulty filters.</p>
          </div>
        </div>
      )}
    </div>
  );
}
