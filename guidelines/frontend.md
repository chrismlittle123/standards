---
id: frontend
title: Frontend
category: architecture
priority: 5
tags: [typescript, nextjs, react, frontend, vercel]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Frontend architecture standards for Next.js and React"
---

## Frontend

All frontends use Next.js. New frontends should use the `progression-labs-development/ui` component library for consistency.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `progression-labs-development/ui` (shared component library)
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

**Not allowed:** Business logic, database access, or anything complex enough to need unit tests. API routes should be simple pass-throughs.

### Components

New frontends should use `progression-labs-development/ui` for standard components. This gives all Progression Labs apps a consistent look and feel.

```bash
pnpm add progression-labs-development/ui
```

- Use `progression-labs-development/ui` components for new projects
- Custom components are allowed when needed, but prefer extending the library
- Built with React + Tailwind CSS + Radix UI primitives

### API Client Generation

`progression-labs-development/ui` includes tooling to generate a typed API client from your backend's OpenAPI spec. Works with both TypeScript (Fastify) and Python (FastAPI via `progression-labs-development/llm`) backends.

- Type-safe frontend API calls
- Stays in sync with backend schemas (Zod → OpenAPI → client)
- No manual API client code

### Standards Enforcement

Frontend projects use frontend-specific code rulesets that include React and Next.js rules on top of the base TypeScript rules:

```toml
[standards]
ruleset = "typescript-frontend-production"  # or typescript-frontend-internal
```

Available code rulesets:
- `typescript-frontend-production` — Customer-facing frontends (strictest)
- `typescript-frontend-internal` — Internal dashboards and tools
- `typescript-frontend-prototype` — Experimental frontends (most relaxed)

The root `standards.toml` handles process standards separately — see [Repository guideline](./repository.md).