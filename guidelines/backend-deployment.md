---
id: backend-deployment
title: Backend Deployment
category: infrastructure
priority: 7
tags: [typescript, python, aws, ecs, lambda, deployment, backend]
---

## Backend Deployment

Use the `@palindrom-ai/infra` package for all AWS deployments.

### Requirements

- Use `@palindrom-ai/infra` for all infrastructure — never write raw SST/CDK directly
- Choose the right compute for your workload (see below)
- All infrastructure changes go through the package

### Installation

```bash
pnpm add @palindrom-ai/infra
```

### What the Package Provides

| Component | AWS Service | Use Case |
|-----------|-------------|----------|
| `Api` | ECS Fargate | Always-on containers, LLM services |
| `Function` | Lambda | Event-driven, simple APIs |
| `Database` | RDS PostgreSQL | Data storage |
| `Storage` | S3 | File uploads |

### When to Use What

| Workload | Component | Why |
|----------|-----------|-----|
| LLM services, long requests | `Api` (ECS) | No cold starts, no timeout limits |
| Simple APIs, low traffic | `Function` (Lambda) | Scales to zero, cost effective |

### Usage

```typescript
import { Api, Database, Storage, Function } from '@palindrom-ai/infra';

const db = new Database("Main");
const bucket = new Storage("Uploads");

const api = new Api("Backend", {
  link: [db, bucket],
});
```

Refer to [palindrom-ai/infra](https://github.com/palindrom-ai/infra) for full documentation.
