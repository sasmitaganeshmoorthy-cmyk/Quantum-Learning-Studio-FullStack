import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { parseLearnerProgress } from '@/lib/api/companion-validation';
import {
  getLearnerProgress,
  saveLearnerProgress,
} from '@/lib/server/chat-repository';
import { isMongoConfigured } from '@/lib/server/mongodb';

export const runtime = 'nodejs';

function getLearnerId(userId: string): string {
  return `user-${userId}`;
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({
      progress: null,
      persisted: false,
    });
  }

  try {
    const learnerId = getLearnerId(userId);
    const progress = await getLearnerProgress(learnerId);

    return NextResponse.json(
      {
        progress,
        persisted: true,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Progress loading failed:', error);

    return NextResponse.json(
      { error: 'Progress data is temporarily unavailable.' },
      { status: 503 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Invalid progress payload.' },
      { status: 400 }
    );
  }

  const learnerId = getLearnerId(userId);

  // Clerk userId is added on the server.
  // The browser cannot save progress under another user.
  const progress = parseLearnerProgress({
    ...(body as Record<string, unknown>),
    learnerId,
  });

  if (!progress) {
    return NextResponse.json(
      { error: 'Invalid progress payload.' },
      { status: 400 }
    );
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({
      progress,
      persisted: false,
    });
  }

  try {
    const persisted = await saveLearnerProgress(progress);

    return NextResponse.json({
      progress,
      persisted,
    });
  } catch (error) {
    console.error('Progress saving failed:', error);

    return NextResponse.json(
      { error: 'Progress data could not be saved.' },
      { status: 503 }
    );
  }
}