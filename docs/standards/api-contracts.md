# API Contracts

**Status:** Standard
**Packages:**
- [`@palindrom/fastify-base`](https://github.com/palindrom-ai/fastify-base) — TypeScript APIs
- [`palindrom-ai/llm`](https://github.com/palindrom-ai/llm) — Python LLM APIs (FastAPI)

---

## Overview

All APIs must use the standard base packages. These enforce consistent error formats, validation, and OpenAPI schema generation.

| API Type | Package | Framework |
|----------|---------|-----------|
| General backend | `@palindrom/fastify-base` | Fastify (TypeScript) |
| LLM services | `palindrom-ai/llm` | FastAPI (Python) |

**Do not create APIs from scratch.** Use the base packages.

---

## Type Flow

**Zod is the single source of truth for all API types.**

```
Zod schemas (TypeScript)
    │
    ├──► fastify-base ──► openapi.yaml
    │                          │
    │                          ▼
    └──────────────────► llm package ──► Pydantic models
```

1. Define schemas in Zod (TypeScript)
2. `fastify-base` generates `openapi.yaml` from Zod + error types
3. `llm` package reads `openapi.yaml` and generates Pydantic models
4. Both artifacts are checked into version control

---

## Generation Workflow

### Commands

```bash
# Generate OpenAPI from Zod schemas
pnpm generate:openapi

# Generate Pydantic models from OpenAPI
pnpm generate:pydantic

# Or generate both
pnpm generate:types
```

### CI Validation

CI must validate that generated files are up to date:

```bash
pnpm generate:types --check
```

This fails if Zod schemas changed but generated files weren't regenerated.

---

## Project Structure

```
my-project/
├── api/                    # Fastify (TypeScript)
│   └── schemas/            # Zod schemas (source of truth)
│       ├── user.ts
│       └── errors.ts
├── llm-service/            # FastAPI (Python)
│   └── models/             # Generated Pydantic models
│       └── generated.py
├── openapi.yaml            # Generated from Zod
└── package.json
```

---

## Protocol

**REST** is the default for all APIs.

Use REST unless you have a documented reason for an alternative (GraphQL, gRPC, etc.) in an ADR.

---

## Unified API

When a product has both TypeScript and Python components, they integrate to present:

- **Single API** to the user
- **Single OpenAPI schema**

The shared `openapi.yaml` serves as the contract between services.

---

## Installation

**TypeScript:**
```bash
pnpm add @palindrom/fastify-base
```

**Python (LLM services):**
```bash
pip install palindrom-llm
```

---

## What the Packages Enforce

| Concern | Handled By |
|---------|------------|
| Schema validation | Zod (TS) / Pydantic (Python) |
| Error format | Standardized error types |
| OpenAPI generation | Auto-generated from Zod |
| Pydantic generation | Auto-generated from OpenAPI |
| Health checks | `/health` endpoint included |
| CORS | Configured defaults |
| Request IDs | Correlation ID middleware |

---

## Error Format

All APIs return errors in a consistent format (defined in Zod, enforced by packages):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "requestId": "req_abc123"
  }
}
```

Error types are defined in Zod and flow through to OpenAPI and Pydantic.

---

## Zod Schema Example

```typescript
// schemas/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
```

This generates:
- TypeScript types (via `z.infer`)
- OpenAPI schemas (via `fastify-base`)
- Pydantic models (via `llm` package from OpenAPI)

---

## Usage

Refer to the package repositories for:

- Zod schema patterns
- Route definition with validation
- OpenAPI generation commands
- Pydantic generation setup
- Error type definitions

The package READMEs are the source of truth.
