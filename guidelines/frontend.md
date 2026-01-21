---
id: frontend
title: Frontend
category: architecture
priority: 5
tags: [typescript, nextjs, react, frontend, vercel]
---

## Frontend

All frontends use Next.js with the `palindrom-ai/ui` component library.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `palindrom-ai/ui` (shadcn/ui-based components)
- Vercel for deployment

### Architecture

Frontend and backend are separate services but colocated in a monorepo (best practice):

- Separate deployments (Vercel for frontend, AWS for backend)
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

Use `palindrom-ai/ui` for all components. For new components, extend the library rather than adding one-off components to your project.

```bash
pnpm add palindrom-ai/ui
```

### API Client Generation

`palindrom-ai/ui` includes tooling to generate a typed API client from your backend's OpenAPI spec. This ensures frontend API calls are type-safe and stay in sync with the backend.
