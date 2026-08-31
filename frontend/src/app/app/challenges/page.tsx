'use client';

import Link from 'next/link';
import { Clock, Star, ChevronRight, Award } from 'lucide-react';
import { mockChallenges } from '@/lib/api/mock-client';

export default function ChallengesList() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Quantum Coding Challenges</h1>
          <p className="text-body-small text-text-secondary">Apply your conceptual understanding to debug broken circuits and code templates.</p>
        </div>
        
        {/* Challenge Stats */}
        <div className="flex items-center gap-2 bg-surface px-4 py-2 border border-border-color rounded-large shadow-xs shrink-0">
          <Award className="text-primary-color h-5 w-5" />
          <span className="text-body-small font-bold text-text-primary">100 Total XP Available</span>
        </div>
      </div>

      {/* Challenges List Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="group bg-surface border border-border-color rounded-large p-6 shadow-xs flex flex-col justify-between gap-6 hover:border-primary-color/50 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-pill bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {challenge.difficulty}
                </span>
                
                <span className="text-caption text-text-secondary flex items-center gap-1">
                  <Clock size={12} /> {challenge.estimatedTimeMinutes} mins
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight text-text-primary group-hover:text-primary-color transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-body-small text-text-secondary leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              {/* Tag Concepts */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {challenge.requiredConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="px-2 py-0.5 rounded-small bg-background border border-border-color text-[10px] font-semibold text-text-secondary"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Reward and Play link */}
            <div className="flex flex-col items-stretch gap-3 pt-4 border-t border-border-color sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 text-warning-color font-bold text-body-small">
                <Star size={16} fill="currentColor" />
                <span>+{challenge.xpReward} XP Reward</span>
              </div>

              <Link
                href={`/app/challenges/${challenge.id}`}
                className="px-4 py-2 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                Attempt Challenge <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
