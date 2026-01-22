---
id: backend-deployment
title: Backend Deployment
category: infrastructure
priority: 7
tags: [typescript, python, gcp, cloud-run, cloud-functions, deployment, backend]
---

## Backend Deployment

Use the `palindrom-ai/infra` package for all GCP deployments.

### Requirements

- Use `palindrom-ai/infra` for all infrastructure — never write raw Pulumi directly
- Choose the right compute for your workload (see below)
- All infrastructure changes go through the package

### Installation

```bash
pnpm add palindrom-ai/infra
```

### What the Package Provides

| Component | GCP Service | Use Case |
|-----------|-------------|----------|
| `Api` | Cloud Run | Always-on containers, LLM services |
| `Function` | Cloud Functions | Event-driven, simple APIs |
| `Database` | Cloud SQL PostgreSQL | Data storage |
| `Storage` | Cloud Storage | File uploads |

### When to Use What

| Workload | Component | Why |
|----------|-----------|-----|
| LLM services, long requests | `Api` (Cloud Run) | No cold starts, no timeout limits |
| Simple APIs, low traffic | `Function` (Cloud Functions) | Scales to zero, cost effective |

### Usage

```typescript
import { Api, Database, Storage, Function } from 'palindrom-ai/infra';

const db = new Database("Main");
const bucket = new Storage("Uploads");

const api = new Api("Backend", {
  link: [db, bucket],
});
```

Refer to [palindrom-ai/infra](https://github.com/palindrom-ai/infra) for full documentation.
