'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { mockClassrooms, mockMisconceptions } from '@/lib/api/mock-client';

export default function InstructorDashboard() {
  const [selectedMiscId, setSelectedMiscId] = useState<string>('misc-001');

  const selectedMisc = mockMisconceptions.find((m) => m.id === selectedMiscId);
  const activeClassroom = mockClassrooms[0];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Instructor Dashboard</h1>
          <p className="text-body-small text-text-secondary">Monitor group mastery, build classrooms, and diagnose common student misconceptions.</p>
        </div>

        {/* Action button */}
        <button className="w-full sm:w-auto px-4 py-2 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0">
          + Create Classroom
        </button>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-color/10 text-primary-color rounded-medium flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Active Classes</span>
            <span className="text-xl font-black text-text-primary">1 Class</span>
          </div>
        </div>

        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-success-color/10 text-success-color rounded-medium flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Total Students</span>
            <span className="text-xl font-black text-text-primary">{activeClassroom.studentCount} Students</span>
          </div>
        </div>

        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-medium flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Average Mastery</span>
            <span className="text-xl font-black text-text-primary">{activeClassroom.averageMastery}%</span>
          </div>
        </div>

        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-medium flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
          <div>
            <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Misconceptions</span>
            <span className="text-xl font-black text-warning-color">2 Flagged</span>
          </div>
        </div>
      </div>

      {/* Split Classroom List vs Misconception Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Classrooms listing and analytic insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Active Classrooms</h3>
            <span className="text-caption text-text-secondary font-medium">Invite Code: <strong>{activeClassroom.inviteCode}</strong></span>
          </div>

          {/* Classroom Card */}
          <div className="p-5 rounded-large bg-surface border border-border-color shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-body-large text-text-primary">{activeClassroom.name}</h4>
              <p className="text-caption text-text-secondary">Average mastery progress is climbing at {activeClassroom.averageMastery}%.</p>
            </div>
            
            <Link
              href={`/instructor/classrooms/${activeClassroom.id}`}
              className="px-4 py-2 border border-border-color bg-background hover:bg-surface-hover text-text-secondary hover:text-text-primary text-body-small font-bold rounded-medium flex items-center gap-1 shrink-0 transition-colors"
            >
              Class Detail <ChevronRight size={16} />
            </Link>
          </div>

          {/* Misconceptions Insights selection map */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold tracking-tight">Class Misconception Diagnostics</h3>
            <p className="text-body-small text-text-secondary">
              We compile student visual submissions to group logical errors and recommend targeted teaching actions.
            </p>

            <div className="space-y-3">
              {mockMisconceptions.map((misc) => {
                const isSelected = selectedMiscId === misc.id;
                return (
                  <button
                    type="button"
                    key={misc.id}
                    onClick={() => setSelectedMiscId(misc.id)}
                    aria-pressed={isSelected}
                    className={`w-full p-4 rounded-large border text-left transition-all hover:bg-surface-hover/50 ${
                      isSelected
                        ? 'border-warning-color bg-warning-color/5 ring-1 ring-warning-color'
                        : 'border-border-color bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="text-warning-color shrink-0 mt-0.5" size={18} />
                        <div>
                          <h4 className="font-bold text-body-small text-text-primary">{misc.conceptName}</h4>
                          <span className="text-caption text-text-secondary capitalize">Target: {misc.conceptId}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-warning-color text-body-large block">{misc.percentageAffected}%</span>
                        <span className="text-[9px] text-text-secondary font-bold uppercase block">Affected</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Misconception Inspector */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight">Diagnostic Details</h3>

          {selectedMisc ? (
            <div className="p-6 rounded-large bg-surface border border-border-color shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-caption font-bold text-warning-color tracking-wide uppercase">MISCONCEPTION HIGHLIGHT</span>
                <h4 className="font-bold text-body-large text-text-primary">{selectedMisc.conceptName}</h4>
              </div>

              <p className="text-body-small text-text-secondary leading-relaxed border-t border-border-color pt-4">
                {selectedMisc.description}
              </p>

              {/* Buggy circuit text preview */}
              <div className="space-y-2">
                <span className="text-caption font-bold text-text-secondary uppercase">Buggy Circuit Pattern</span>
                <pre className="p-3 bg-background border border-border-color/50 rounded-medium font-mono text-[11px] text-text-secondary overflow-x-auto leading-tight">
                  <code>{selectedMisc.exampleErrorSnippet}</code>
                </pre>
              </div>

              {/* Remedy action recommendation card */}
              <div className="p-4 rounded-large bg-warning-color/5 border border-warning-color/20 space-y-3">
                <span className="text-caption font-bold text-warning-color tracking-wide uppercase flex items-center gap-1">
                  <Sparkles size={12} /> Recommended Lesson Revision
                </span>
                <p className="text-body-small text-text-secondary font-semibold">
                  {selectedMisc.remedyAction}
                </p>

                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-warning-color hover:bg-warning-color/90 text-white text-[11px] font-bold rounded-medium transition-colors shadow-xs">
                    Assign corrective quiz
                  </button>
                </div>
              </div>

              {/* Affected Students List (Anonymized classroom analytics) */}
              <div className="pt-4 border-t border-border-color space-y-3">
                <span className="text-caption font-bold text-text-secondary uppercase">Affected Student Identifiers</span>
                <div className="flex flex-wrap gap-2">
                  {selectedMisc.affectedStudentIds.map((stuId) => (
                    <span
                      key={stuId}
                      className="px-2.5 py-1 bg-background border border-border-color rounded-medium font-mono text-[10px] font-semibold text-text-secondary"
                    >
                      {stuId.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-large bg-surface border border-border-color shadow-xs text-center text-caption text-text-secondary">
              Select a misconception flagged above to view diagnostic details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
