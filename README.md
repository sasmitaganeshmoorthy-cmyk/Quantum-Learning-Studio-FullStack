# Quantum Learning Studio FullStack

The project is separated into two independently deployable applications:

- `frontend/` — Next.js 16, React, Tailwind CSS and Clerk UI/session handling.
- `backend/` — Express, MongoDB, Clerk request verification and Gemini-compatible AI.

## Prerequisites

- Node.js 20.9 or newer
- npm
- MongoDB Atlas connection string
- Clerk application keys
- Optional Gemini API key (the local quantum tutor works without it)

## 1. Install dependencies

From the repository root:

```bash
npm install
```

## 2. Configure the frontend

Copy `frontend/.env.example` to `frontend/.env.local` and provide real values:

```env
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me
CLERK_SECRET_KEY=sk_test_replace_me
```

## 3. Configure the backend

Copy `backend/.env.example` to `backend/.env.local` and provide real values:

```env
PORT=4000
FRONTEND_URLS=http://localhost:3000
MONGODB_URI=mongodb+srv://replace_me
MONGODB_DB=quantum_learning_studio
AI_API_KEY=replace_me
AI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AI_MODEL=gemini-3.5-flash-lite
CLERK_PUBLISHABLE_KEY=pk_test_replace_me
CLERK_SECRET_KEY=sk_test_replace_me
```

Never commit either `.env.local` file.

## 4. Run both applications

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:4000/api/health`
- Proxied health check: `http://localhost:3000/api/health`

The frontend keeps using `/api/...`. Next.js rewrites those requests to the backend, so existing UI components do not need hard-coded cross-origin URLs. Both layers verify protected routes with Clerk.

## Commands

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck
```

## Deployment

Deploy `frontend/` to Vercel and set `BACKEND_URL` to the public backend URL. Deploy `backend/` to a Node.js host such as Render and set `FRONTEND_URLS` to the Vercel site URL. Add the remaining secrets separately to each hosting provider.
