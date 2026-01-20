# Observability

**Status:** Standard
**Package:** [`@palindrom/logging`](https://github.com/palindrom-ai/logging)

---

## Overview

All application observability must go through the `@palindrom/logging` package. This package provides unified logging, error tracking, and uptime monitoring across all Palindrom TypeScript services, with Better Stack as the underlying provider.

**Do not integrate Better Stack directly.** Use `@palindrom/logging` instead.

For LLM-specific observability (traces, tokens, costs), see [LLM Observability](./llm-observability.md).

---

## Installation

```bash
pnpm add @palindrom/logging
```

---

## What It Covers

| Concern | Included |
|---------|----------|
| Structured logging | JSON logs with consistent fields |
| Error tracking | Exceptions with stack traces and context |
| Request logging | HTTP method, path, status, duration |
| Uptime monitoring | Health check endpoints |
| Correlation IDs | Request tracing across services |
| Infrastructure metrics | Lambda cold starts, duration, memory |

---

## Usage

Refer to the [`palindrom-ai/logging`](https://github.com/palindrom-ai/logging) repository for:

- Fastify plugin integration
- Next.js configuration
- Structured logging patterns
- Error capturing with context
- Correlation ID propagation
- Health check setup

The package README is the source of truth for implementation details.

---

## Required Fields

All log entries must include:

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp |
| `level` | debug, info, warn, error |
| `message` | Human-readable message |
| `requestId` | Correlation ID for the request |
| `service` | Service name |
| `environment` | development, staging, production |

Additional context fields are encouraged (userId, feature, etc).

---

## Log Levels

| Level | Use For |
|-------|---------|
| `debug` | Development only, verbose details |
| `info` | Normal operations, request completion |
| `warn` | Recoverable issues, degraded performance |
| `error` | Failures requiring attention |

---

## What NOT to Log

- Passwords or secrets
- Full API keys (mask all but last 4 chars)
- PII unless required and compliant
- Large payloads (truncate or summarize)

---

## Why This Exists

- **Consistency** — Same log format across all services
- **Correlation** — Trace requests across service boundaries
- **Single dashboard** — All services in one Better Stack workspace
- **Upgrades** — Update Better Stack SDK in one place
