'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileSpreadsheet
} from 'lucide-react';
import { mockClassrooms } from '@/lib/api/mock-client';

export default function ClassroomDetail({ params }: { params: Promise<{ classroomId: string }> }) {
  const router = useRouter();
  const { classroomId } = use(params);

  const classroom = mockClassrooms.find((c) => c.id === classroomId);

  if (!classroom) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Classroom not found</h1>
        <p className="text-text-secondary">We could not locate this student group.</p>
        <Link href="/instructor/dashboard" className="inline-flex py-2 px-4 bg-primary-color text-white rounded-medium">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Mock Student roster progress data
  const studentsRoster = [
    { id: 'stu-001', name: 'Alex Quantum', completedLessons: 2, completedChallenges: 1, mastery: 85, lastActive: '2h ago' },
    { id: 'stu-002', name: 'Marie Curie', completedLessons: 4, completedChallenges: 2, mastery: 95, lastActive: '1d ago' },
    { id: 'stu-003', name: 'Richard Feynman', completedLessons: 1, completedChallenges: 0, mastery: 65, lastActive: '3h ago' },
    { id: 'stu-004', name: 'Niels Bohr', completedLessons: 3, completedChallenges: 1, mastery: 78, lastActive: '2d ago' }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-body-small text-text-secondary hover:text-text-primary font-semibold"
        >
          <ArrowLeft size={16} /> Back to Instructor Home
        </button>
      </div>

      {/* Classroom Header */}
      <div className="bg-surface border border-border-color rounded-large p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-pill bg-primary-color/10 text-primary-color text-[10px] font-bold uppercase tracking-wider">
              Class Roster
            </span>
            <span className="text-caption text-text-secondary font-semibold">
              Invite Code: <strong>{classroom.inviteCode}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{classroom.name}</h1>
          <p className="text-body-small text-text-secondary">Assigned course path: <strong>Quantum Entanglement & Multi-Qubit Systems</strong>.</p>
        </div>

        {/* Export spreadsheet CTA */}
        <div className="shrink-0">
          <button className="w-full md:w-auto px-5 py-2.5 bg-background hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-color text-body-small font-bold rounded-medium transition-colors flex items-center justify-center gap-1.5">
            <FileSpreadsheet size={16} /> Export Academic Report
          </button>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight">Student Progress Tracker</h3>

        <div className="bg-surface border border-border-color rounded-large overflow-hidden shadow-xs">
          {/* Accessible Semantic HTML5 Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left border-collapse text-body-small">
              <caption className="sr-only">Student lesson, challenge, mastery, and activity progress</caption>
              <thead>
                <tr className="bg-surface-hover/50 border-b border-border-color text-text-secondary font-semibold">
                  <th scope="col" className="p-4">Student Name</th>
                  <th scope="col" className="p-4 text-center">Lessons Completed</th>
                  <th scope="col" className="p-4 text-center">Challenges Solved</th>
                  <th scope="col" className="p-4 text-center">Mastery Score</th>
                  <th scope="col" className="p-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {studentsRoster.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-hover/20">
                    <th scope="row" className="p-4 font-bold text-text-primary">{student.name}</th>
                    <td className="p-4 text-center font-mono">{student.completedLessons}</td>
                    <td className="p-4 text-center font-mono">{student.completedChallenges}</td>
                    <td className="p-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${
                        student.mastery >= 85
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                      }`}>
                        {student.mastery}%
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">{student.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
