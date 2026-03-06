---
id: rest-apis
title: REST APIs
category: architecture
priority: 2
tags: [typescript, python, api, zod, pydantic, backend]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "REST API design standards including validation and error handling"
---

## REST APIs

All APIs must use the standard base packages with Zod as the single source of truth.

### Requirements

- Use `progression-labs-development/fastify-api` for TypeScript APIs (Fastify)
- Use `progression-labs-development/llm` for Python LLM APIs (FastAPI is wrapped inside — never build FastAPI directly)
- Define all schemas in Zod (TypeScript)
- Generate OpenAPI from Zod, generate Pydantic from OpenAPI
- Check generated files into version control
- CI validates generated files are up to date

### Type Flow

```
Zod schemas ──► fastify-api ──► openapi.yaml ──► llm package ──► Pydantic
```

### Installation

**TypeScript:**
```bash
pnpm add progression-labs-development/fastify-api
```

**Python:**
```bash
uv add progression-labs-development/llm
```

### Generation Commands

```bash
pnpm generate:types        # Generate OpenAPI + Pydantic
pnpm generate:types --check # CI validation (fails if drift)
```

### Error Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "requestId": "req_abc123"
  }
}
```

### Zod Example

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),  // Prefixed nanoid — see conventions guideline
  email: z.string().email(),
  name: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;
```

This generates TypeScript types, OpenAPI schemas, and Pydantic models.