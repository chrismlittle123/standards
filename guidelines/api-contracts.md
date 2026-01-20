---
id: api-contracts
title: API Contracts
category: architecture
priority: 2
---

## API Contracts

All APIs must use the standard base packages.

### Requirements

- Use `@palindrom/fastify-base` for TypeScript APIs (Fastify)
- Use `palindrom-ai/llm` for Python LLM APIs (FastAPI)
- REST is the default protocol
- All endpoints documented in OpenAPI
- Use standardized error format

### Installation

**TypeScript:**
```bash
pnpm add @palindrom/fastify-base
```

**Python:**
```bash
pip install palindrom-llm
```

### API Types

| API Type | Package | Framework |
|----------|---------|-----------|
| General backend | `@palindrom/fastify-base` | Fastify |
| LLM services | `palindrom-ai/llm` | FastAPI |

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

### Unified APIs

When combining TypeScript + Python services, both packages integrate to present a single API with one OpenAPI schema. Refer to package docs for integration setup.
