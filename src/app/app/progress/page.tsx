'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  CheckCircle,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { mockUser, mockConcepts } from '@/lib/api/mock-client';

export default function MasteryProgress() {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('entanglement');

  const selectedConcept = mockConcepts.find((c) => c.conceptId === selectedConceptId);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mastery & Progress</h1>
        <p className="text-body-small text-text-secondary">Analyze your learning history, identify focus areas, and map concept prerequisite paths.</p>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs space-y-1">
          <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">XP Level</span>
          <span className="text-2xl font-black text-primary-color">{mockUser.xp} XP</span>
        </div>
        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs space-y-1">
          <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Completed Lessons</span>
          <span className="text-2xl font-black text-success-color">2 Lessons</span>
        </div>
        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs space-y-1">
          <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Active Streak</span>
          <span className="text-2xl font-black text-warning-color flex items-center gap-1">
            <Flame className="animate-bounce" size={24} /> {mockUser.streak} Days
          </span>
        </div>
        <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs space-y-1">
          <span className="text-caption text-text-secondary font-bold uppercase tracking-wider block">Unlocked Badges</span>
          <span className="text-2xl font-black text-text-primary">3 Badges</span>
        </div>
      </div>

      {/* Main Split tree vs detail inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Concept mastery path tree list */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold tracking-tight">Concept Prerequisite Map</h3>
          
          <div className="space-y-4">
            {mockConcepts.map((concept) => {
              const isSelected = selectedConceptId === concept.conceptId;
              const isMastered = concept.status === 'mastered';
              const isLocked = concept.status === 'locked';

              return (
                <div
                  key={concept.conceptId}
                  onClick={() => setSelectedConceptId(concept.conceptId)}
                  className={`p-4 rounded-large border flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-surface-hover/50 ${
                    isSelected
                      ? 'border-primary-color bg-primary-color/5 ring-1 ring-primary-color'
                      : 'border-border-color bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isMastered ? (
                      <CheckCircle className="text-success-color shrink-0" size={20} />
                    ) : isLocked ? (
                      <Lock className="text-text-secondary/40 shrink-0" size={20} />
                    ) : (
                      <div className="h-5 w-5 shrink-0 border-2 border-primary-color rounded-full animate-pulse" />
                    )}
                    
                    <div>
                      <h4 className="font-bold text-body-small text-text-primary">{concept.name}</h4>
                      <span className="text-caption text-text-secondary capitalize">{concept.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-body-small font-bold text-text-primary block">
                        {concept.masteryPercent}%
                      </span>
                      <span className="text-[10px] text-text-secondary font-semibold uppercase leading-none block">
                        Mastery
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Node Details Inspector */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight">Concept Details</h3>
          
          {selectedConcept ? (
            <div className="p-6 rounded-large bg-surface border border-border-color shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] text-primary-color bg-primary-color/10 px-2.5 py-0.5 rounded-pill font-bold tracking-wide uppercase">
                  {selectedConcept.category}
                </span>
                <h4 className="font-bold text-body-large text-text-primary">{selectedConcept.name}</h4>
              </div>

              {/* Status and description */}
              <div className="space-y-3 pt-4 border-t border-border-color">
                <div className="flex justify-between text-body-small font-semibold">
                  <span className="text-text-secondary">Mastery level</span>
                  <span className="text-primary-color">{selectedConcept.masteryPercent}%</span>
                </div>
                <div className="w-full bg-background border border-border-color/30 h-2.5 rounded-pill overflow-hidden">
                  <div
                    className="bg-primary-color h-full transition-all duration-standard"
                    style={{ width: `${selectedConcept.masteryPercent}%` }}
                  />
                </div>
              </div>

              {/* Dependencies info */}
              <div className="space-y-2 text-caption">
                <span className="font-bold text-text-secondary uppercase">Prerequisites</span>
                <p className="text-text-secondary">
                  {selectedConcept.dependencies.length > 0
                    ? `Requires completion of: ${selectedConcept.dependencies.join(', ')}`
                    : 'None. Open foundations concept.'}
                </p>
              </div>

              {/* Recommendation card */}
              {selectedConcept.recommendedNextActivity && (
                <div className="p-4 rounded-large bg-primary-color/5 border border-primary-color/20 space-y-3">
                  <span className="text-caption font-bold text-primary-color tracking-wide uppercase flex items-center gap-1">
                    <Sparkles size={12} /> Next Recommended Step
                  </span>
                  <p className="text-body-small text-text-secondary font-semibold">
                    {selectedConcept.recommendedNextActivity.label}
                  </p>
                  
                  <Link
                    href="/app/lessons/lesson-102-1"
                    className="w-full py-2 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    Go to Activity <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-large bg-surface border border-border-color shadow-xs text-center text-caption text-text-secondary">
              Select a concept node from the map to inspect details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
