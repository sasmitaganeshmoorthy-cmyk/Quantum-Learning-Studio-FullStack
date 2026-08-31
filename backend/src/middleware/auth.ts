import { getAuth } from '@clerk/express';
import type { Request, Response } from 'express';

export function requireUserId(request: Request, response: Response): string | null {
  const { userId } = getAuth(request);

  if (!userId) {
    response.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return userId;
}
