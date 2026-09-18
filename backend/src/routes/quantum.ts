import { Router } from 'express';

import { requireUserId } from '../middleware/auth';

export const quantumRouter = Router();

function serviceUrl(): string {
  return (process.env.QUANTUM_SERVICE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
}

async function readServiceResponse(serviceResponse: Response): Promise<unknown> {
  const text = await serviceResponse.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      detail: text || 'Quantum service returned an invalid response.',
    };
  }
}

quantumRouter.get('/backends', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  try {
    const serviceResponse = await fetch(`${serviceUrl()}/backends`, {
      signal: AbortSignal.timeout(5000),
    });

    const result = await readServiceResponse(serviceResponse);
    response.status(serviceResponse.status).json(result);
  } catch (error) {
    console.error('Quantum backend discovery failed:', error);

    response.status(503).json({
      error:
        'The Python quantum service is not running. Start it with npm run dev:quantum.',
    });
  }
});

quantumRouter.post('/simulate', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  try {
    const serviceResponse = await fetch(`${serviceUrl()}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
      signal: AbortSignal.timeout(120_000),
    });

    const result = await readServiceResponse(serviceResponse);
    response.status(serviceResponse.status).json(result);
  } catch (error) {
    console.error('Quantum simulation request failed:', error);

    response.status(503).json({
      error:
        'The selected simulator is unavailable. Confirm that the Python quantum service is running.',
    });
  }
});
