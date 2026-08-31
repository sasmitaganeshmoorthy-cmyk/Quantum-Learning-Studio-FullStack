import { NextResponse } from 'next/server';

import { isExternalAiConfigured } from '@/lib/server/ai-provider';
import { getMongoDatabase, isMongoConfigured } from '@/lib/server/mongodb';

export const runtime = 'nodejs';

export async function GET() {
  let database: 'connected' | 'not-configured' | 'unavailable' = isMongoConfigured() ? 'unavailable' : 'not-configured';
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDatabase();
      await db?.command({ ping: 1 });
      database = 'connected';
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      database = 'unavailable';
    }
  }

  return NextResponse.json({
    status: database === 'unavailable' ? 'degraded' : 'ok',
    database,
    externalAi: isExternalAiConfigured() ? 'configured' : 'local-fallback',
    timestamp: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

