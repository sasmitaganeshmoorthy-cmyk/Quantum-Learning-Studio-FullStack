'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { mockCourses } from '@/lib/api/mock-client';
import { InteractivePageHero } from '@/components/visual/interactive-page-hero';

export default function CourseDetail({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const { courseId } = use(params);
  const [showFoundationVideo, setShowFoundationVideo] = useState(false);

  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="text-text-secondary">The requested course could not be located in our catalogue.</p>
        <Link href="/app/catalog" className="inline-flex py-2 px-4 bg-primary-color text-white rounded-medium">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  // Mock modules matching the selected course
  const courseModules =
    courseId === 'course-101'
      ? [
          {
            id: 'mod-101-1',
            title: 'Module 1: Foundations of Quantum Information',
            description: 'Introduction to linear algebra, Dirac notation, and qubit state geometry.',
            lessons: [
              { id: 'lesson-101-1', title: 'Qubits & The Bloch Sphere', duration: '20 mins', isCompleted: true },
              { id: 'lesson-101-2', title: 'Dirac Bracket Notation', duration: '15 mins', isCompleted: true },
              { id: 'lesson-101-3', title: 'Measuring Qubit States', duration: '25 mins', isCompleted: false }
            ]
          },
          {
            id: 'mod-101-2',
            title: 'Module 2: Single-Qubit Manipulations',
            description: 'Learn to rotate qubits using Pauli operations and put states into superposition.',
            lessons: [
              { id: 'lesson-101-4', title: 'Pauli X, Y, and Z Gates', duration: '25 mins', isCompleted: false },
              { id: 'lesson-101-5', title: 'Superposition & The Hadamard Gate', duration: '30 mins', isCompleted: false }
            ]
          }
        ]
      : [
          {
            id: 'mod-102-1',
            title: 'Module 1: Principles of Entanglement',
            description: 'Build correlation grids, understand phase changes, and entangle qubit matrices.',
            lessons: [
              { id: 'lesson-102-1', title: 'Building Bell States', duration: '30 mins', isCompleted: false },
              { id: 'lesson-102-2', title: 'Understanding Separability', duration: '20 mins', isCompleted: false },
              { id: 'lesson-102-3', title: 'Einstein-Podolsky-Rosen (EPR) Paradox', duration: '35 mins', isCompleted: false }
            ]
          }
        ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-body-small text-text-secondary hover:text-text-primary font-semibold"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      <InteractivePageHero
        eyebrow={`${course.difficulty} learning module`}
        title={course.title}
        description={course.description}
        imageSrc={courseId === 'course-102' ? '/images/quantum/entanglement-module.png' : '/images/quantum/learning-pathway.png'}
        imageAlt={courseId === 'course-102' ? 'Two luminous entangled qubit cores connected by a precise energy lattice' : 'A connected three-dimensional pathway through quantum computing concepts'}
        accent={courseId === 'course-102' ? 'violet' : 'cyan'}
        compact
        actions={
          <Link href={`/app/lessons/${courseId === 'course-101' ? 'lesson-101-1' : 'lesson-102-1'}`} className="app-hero-primary">
            <Play size={16} fill="currentColor" /> {course.progressPercent > 0 ? 'Continue course' : 'Start course'}
          </Link>
        }
        metrics={
          <>
            <div className="app-hero-metric"><strong>{course.progressPercent}%</strong><span>Completed</span></div>
            <div className="app-hero-metric"><strong>{course.lessonsCount}</strong><span>Lessons</span></div>
            <div className="app-hero-metric"><strong>{course.estimatedDuration}</strong><span>Duration</span></div>
          </>
        }
      />

      {/* Split Details & Syllabus content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Syllabus structure */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold tracking-tight">Syllabus Outline</h3>
          
          <div className="space-y-6">
            {courseModules.map((module) => (
              <div key={module.id} className="app-depth-card app-interactive-card rounded-large p-5 space-y-4">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (module.id === 'mod-101-1') {
                        setShowFoundationVideo(!showFoundationVideo);
                      }
                    }}
                    className="w-full text-left"
                  >
                    <h4 className="font-bold text-body-large text-text-primary hover:text-primary-color transition-colors">
                      {module.title}
                    </h4>

                    <p className="text-caption text-text-secondary">
                      {module.description}
                    </p>

                    {module.id === 'mod-101-1' && (
                      <p className="text-caption text-primary-color mt-2 font-semibold">
                        Click to {showFoundationVideo ? 'hide' : 'watch'} introduction video
                      </p>
                    )}
                  </button>
                </div>
                {module.id === 'mod-101-1' && showFoundationVideo && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold tracking-tight mb-3">
                      Introduction to Quantum Computing
                    </h3>

                    <div className="w-full rounded-large overflow-hidden bg-black">
                      <video
                        className="w-full h-auto max-h-[600px] mx-auto"
                        controls
                        preload="metadata"
                      >
                        <source src="/videos/video1.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="relative z-10 p-3 bg-background/80 rounded-medium border border-border-color/50 flex items-center justify-between gap-4 hover:border-primary-color/50 hover:translate-x-1 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.isCompleted ? (
                          <CheckCircle className="text-success-color shrink-0" size={18} />
                        ) : (
                          <div className="h-[18px] w-[18px] shrink-0 border-2 border-border-color rounded-full" />
                        )}
                        <span className={`text-body-small font-semibold ${lesson.isCompleted ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-caption text-text-secondary">{lesson.duration}</span>
                        <Link
                          href={`/app/lessons/${lesson.id}`}
                          className="p-1 hover:bg-surface-hover rounded-medium text-text-secondary hover:text-text-primary"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Prerequisites and outcomes */}
        <div className="space-y-8">
          {/* Outcomes Card */}
          <div className="app-depth-card app-interactive-card p-6 rounded-large space-y-4">
            <h4 className="font-bold text-body-large flex items-center gap-2">
              <Award className="text-primary-color" size={20} /> Learning Outcomes
            </h4>
            <ul className="space-y-2.5">
              {course.outcomes.map((o, idx) => (
                <li key={idx} className="text-body-small text-text-secondary flex items-start gap-2">
                  <span className="text-primary-color font-bold mt-0.5">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites Card */}
          <div className="app-depth-card app-interactive-card p-6 rounded-large space-y-4">
            <h4 className="font-bold text-body-large flex items-center gap-2">
              <HelpCircle className="text-secondary-color" size={20} /> Prerequisites
            </h4>
            <ul className="space-y-2.5">
              {course.prerequisites.map((p, idx) => (
                <li key={idx} className="text-body-small text-text-secondary flex items-start gap-2">
                  <span className="text-secondary-color font-bold mt-0.5">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
