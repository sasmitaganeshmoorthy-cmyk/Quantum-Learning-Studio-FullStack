import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { parseCompanionChatRequest } from '@/lib/api/companion-validation';
import { answerCompanionQuestion } from '@/lib/server/chat-service';
import { allowRequest } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'You must sign in before using the companion.' },
      { status: 401 }
    );
  }

  if (!allowRequest(`chat:${userId}`)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
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

  const parsed = parseCompanionChatRequest(body);

  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid chat request.' },
      { status: 400 }
    );
  }

  const response = await answerCompanionQuestion({
    ...parsed,

    // Never trust a session ID supplied by the browser.
    sessionId: `user-${userId}`,
  });

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}