---
id: frontend
title: Frontend
category: architecture
priority: 5
tags: [typescript, nextjs, react, frontend, vercel]
author: Engineering Team
lastUpdated: "2024-03-15"
summary: "Frontend architecture standards for Next.js and React"
---

## Frontend

All frontends use Next.js with the `palindrom-ai/ui` component library.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `palindrom-ai/ui` (shared component library)
- Vercel for deployment

### Architecture

Frontend and backend are separate services but colocated in a monorepo (best practice):

- Separate deployments (Vercel for frontend, GCP Cloud Run for backend)
- Same repository when using a monorepo
- Frontend imports types from backend (single source of truth)
- Frontend calls backend APIs — no business logic in Next.js

### API Routes

Only allowed as a thin BFF layer:

- Auth token exchange
- Aggregating backend calls
- Proxying to avoid CORS

**Not allowed:** Business logic, database access, anything requiring unit tests.

### Components

Use `palindrom-ai/ui` for all standard components. This gives all Palindrom apps a consistent look and feel.

```bash
pnpm add palindrom-ai/ui
```

- Use `palindrom-ai/ui` components by default for simplicity
- Custom components are allowed when needed, but prefer extending the library
- Built with React + Tailwind CSS

### API Client Generation

`palindrom-ai/ui` includes tooling to generate a typed API client from your backend's OpenAPI spec. Works with both TypeScript (Fastify) and Python (FastAPI via `palindrom-ai/llm`) backends.

- Type-safe frontend API calls
- Stays in sync with backend schemas (Zod → OpenAPI → client)
- No manual API client code