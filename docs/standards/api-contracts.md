# API Contracts

**Status:** Standard
**Packages:**
- [`@palindrom/fastify-base`](https://github.com/palindrom-ai/fastify-base) — TypeScript APIs
- [`palindrom-ai/llm`](https://github.com/palindrom-ai/llm) — Python LLM APIs (FastAPI)

---

## Overview

All APIs must use the standard base packages. These enforce consistent error formats, versioning, and OpenAPI schema generation.

| API Type | Package | Framework |
|----------|---------|-----------|
| General backend | `@palindrom/fastify-base` | Fastify (TypeScript) |
| LLM services | `palindrom-ai/llm` | FastAPI (Python) |

**Do not create APIs from scratch.** Use the base packages.

---

## Protocol

**REST** is the default for all APIs.

Use REST unless you have a documented reason for an alternative (GraphQL, gRPC, etc.) in an ADR.

---

## Unified API

When a product has both TypeScript and Python components, they integrate to present:

- **Single API** to the user
- **Single OpenAPI schema**

The `@palindrom/fastify-base` and `palindrom-ai/llm` packages handle this integration. Refer to the package documentation for setup.

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
| Error format | Standardized error responses |
| Versioning | URL path versioning (`/v1/...`) |
| OpenAPI generation | Auto-generated from route definitions |
| Request validation | Schema validation on inputs |
| Health checks | `/health` endpoint included |
| CORS | Configured defaults |
| Request IDs | Correlation ID middleware |

---

## Error Format

All APIs return errors in a consistent format (enforced by packages):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "requestId": "req_abc123"
  }
}
```

---

## OpenAPI

- All endpoints must be documented in OpenAPI
- Schemas are auto-generated from route definitions
- The packages handle schema merging for unified APIs

---

## Usage

Refer to the package repositories for:

- Route definition patterns
- Error handling
- Validation setup
- OpenAPI customization
- Integration between Fastify and FastAPI

The package READMEs are the source of truth.
