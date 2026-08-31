# Backend Setup

The project now includes a Next.js server API, an optional MongoDB database, and an optional OpenAI-compatible AI provider. It runs immediately without either external service by using the local quantum tutor.

## 1. Configure environment variables

Copy `.env.example` to `.env.local` and update the values:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=quantum_learning_studio

AI_API_KEY=
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

Keep `.env.local` private. Server secrets must never use the `NEXT_PUBLIC_` prefix.

## 2. MongoDB Atlas

1. Create a MongoDB Atlas project and free cluster.
2. Create a database user.
3. Add your development IP address under Network Access.
4. Copy the driver connection string into `MONGODB_URI`.
5. Restart `npm run dev`.
6. Open `http://localhost:3000/api/health` and confirm that `database` is `connected`.

The application creates these collections and indexes automatically:

- `chat_sessions`: optional user-consented chat persistence keyed by `sessionId`.
- `learner_progress`: module completion, concept mastery and next recommendations keyed by `learnerId`.

## 3. AI provider behavior

- Without `AI_API_KEY`, `/api/v1/companion/chat` uses the fast local quantum tutor.
- With a configured provider, it is still used only when the learner enables **Enhanced AI** in the widget.
- When Enhanced AI is off, learner progress and chat messages are not sent to the external model provider.
- If the provider times out or fails, the endpoint returns a local answer automatically.
- **Save chat** is separate and opt-in. It stores history in your MongoDB database when configured.

## 4. API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Database and AI configuration health |
| `POST` | `/api/v1/companion/chat` | Contextual quantum answer with local fallback |
| `GET` | `/api/v1/companion/history?sessionId=...` | Read an opted-in MongoDB chat session |
| `DELETE` | `/api/v1/companion/history?sessionId=...` | Delete an opted-in MongoDB chat session |
| `GET` | `/api/v1/progress?learnerId=...` | Read learner progress |
| `PATCH` | `/api/v1/progress` | Create or update learner progress |

## 5. Example progress request

```bash
curl -X PATCH http://localhost:3000/api/v1/progress \
  -H "Content-Type: application/json" \
  -d '{
    "learnerId": "learner-demo-001",
    "completedModules": ["Qubits", "Superposition"],
    "mastery": { "Qubits": 90, "Entanglement": 45 },
    "suggestedNext": "Build and explain a Bell-state circuit"
  }'
```

## 6. Production notes

The current endpoints validate input, limit chat request frequency, avoid caching private responses, and keep secrets server-only. Before public deployment, connect the existing login UI to a real authentication provider and replace request-supplied learner/session identifiers with authenticated server-side identities.

