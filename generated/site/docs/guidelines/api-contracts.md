
## API Contracts

All APIs must use the standard base packages with Zod as the single source of truth.

### Requirements

- Use `@palindrom/fastify-base` for TypeScript APIs (Fastify)
- Use `palindrom-ai/llm` for Python LLM APIs (FastAPI)
- Define all schemas in Zod (TypeScript)
- Generate OpenAPI from Zod, generate Pydantic from OpenAPI
- Check generated files into version control
- CI validates generated files are up to date

### Type Flow

```
Zod schemas ──► fastify-base ──► openapi.yaml ──► llm package ──► Pydantic
```

### Installation

**TypeScript:**
```bash
pnpm add @palindrom/fastify-base
```

**Python:**
```bash
pip install palindrom-llm
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
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;
```

This generates TypeScript types, OpenAPI schemas, and Pydantic models.
