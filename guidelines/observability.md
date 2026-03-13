---
id: observability
title: Observability
category: operations
priority: 2
tags: [typescript, python, logging, observability, monitoring, signoz, backend]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Logging, tracing, and monitoring standards"
---

## Observability

Observability has two parts: the **instrumentation** (in your app) and the **backend** (where telemetry goes).

- **Instrumentation:** Built into `progression-labs-dev/fastify-api`. Every Fastify API gets OpenTelemetry tracing, logging, and metrics automatically — no manual setup needed.
- **Backend:** `progression-labs-dev/monitoring` deploys and manages the SigNoz observability stack on GCP Compute Engine.

### Requirements

- Use `progression-labs-dev/fastify-api` for TypeScript API instrumentation — never import `@opentelemetry/*` packages directly in application code
- Use structured JSON logging with consistent fields
- Include `requestId` in all log entries for correlation
- Never log secrets, passwords, or unmasked API keys

### Instrumentation

Instrumentation is automatic when using the standard packages:

- **TypeScript APIs:** `progression-labs-dev/fastify-api` includes OpenTelemetry tracing, metrics, and structured logging out of the box
- **Python LLM services:** `progression-labs-dev/llm` includes observability via Langfuse

### Required Log Fields

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp |
| `level` | debug, info, warn, error |
| `message` | Human-readable message |
| `requestId` | Correlation ID |
| `service` | Service name |
| `environment` | dev, stag, prod |

### Log Levels

| Level | Use For |
|-------|---------|
| `debug` | Development only |
| `info` | Normal operations |
| `warn` | Recoverable issues |
| `error` | Failures requiring attention |

### Observability Backend

The `progression-labs-dev/monitoring` repo deploys and manages the SigNoz stack (the backend that receives and visualizes telemetry data). This is infrastructure — not an application-level library.

Refer to [progression-labs-dev/monitoring](https://github.com/progression-labs-dev/monitoring) for infrastructure setup and [progression-labs-dev/fastify-api](https://github.com/progression-labs-dev/fastify-api) for instrumentation details.