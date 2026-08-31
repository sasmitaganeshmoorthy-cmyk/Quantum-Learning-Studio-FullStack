import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import {
  deleteChatHistory,
  getChatHistory,
} from '@/lib/server/chat-repository';
import { isMongoConfigured } from '@/lib/server/mongodb';

export const runtime = 'nodejs';

function getUserChatId(userId: string): string {
  return `user-${userId}`;
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'You must sign in to access chat history.' },
      { status: 401 }
    );
  }

  const sessionId = getUserChatId(userId);

  if (!isMongoConfigured()) {
    return NextResponse.json({
      sessionId,
      messages: [],
      persisted: false,
    });
  }

  try {
    const messages = await getChatHistory(sessionId);

    return NextResponse.json(
      {
        sessionId,
        messages,
        persisted: true,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Chat history is temporarily unavailable.' },
      { status: 503 }
    );
  }
}

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'You must sign in to delete chat history.' },
      { status: 401 }
    );
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({
      deleted: false,
      persisted: false,
    });
  }

  try {
    const deleted = await deleteChatHistory(getUserChatId(userId));
    return NextResponse.json({ deleted, persisted: true });
  } catch {
    return NextResponse.json(
      { error: 'Chat history could not be deleted.' },
      { status: 503 }
    );
  }
}