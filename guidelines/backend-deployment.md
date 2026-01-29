---
id: backend-deployment
title: Backend Deployment
category: infrastructure
priority: 7
tags: [typescript, python, gcp, aws, cloud-run, cloud-functions, deployment, backend]
author: Engineering Team
lastUpdated: "2024-03-15"
summary: "Deployment standards for backend services on GCP and AWS"
---

## Backend Deployment

Use the `palindrom-ai/infra` package for all deployments.

### Requirements

- Use `palindrom-ai/infra` for all infrastructure — never write raw Pulumi directly
- Choose the right cloud for your workload (see below)
- All infrastructure changes go through the package

### Installation

```bash
pnpm add palindrom-ai/infra
```

### Cloud Selection

| Workload | Cloud | Why |
|----------|-------|-----|
| APIs (Fastify) | GCP Cloud Run | Fast redeployments, scales to zero |
| Long-running LLM services | GCP Cloud Run | Fast redeployments, no timeout limits |
| Databases | AWS RDS | Managed PostgreSQL, set up once |
| Monitoring infrastructure (SigNoz) | AWS | Set up once, rarely changes |
| Static infrastructure | AWS | Set up once, rarely changes |

**Rule of thumb:** If it redeploys frequently, use GCP Cloud Run. If it's set up once and rarely changes, use AWS.

### What the Package Provides

| Component | Service | Use Case |
|-----------|---------|----------|
| `Api` | GCP Cloud Run | Fastify APIs, LLM services |
| `Function` | GCP Cloud Functions | Event-driven, simple endpoints |
| `Database` | AWS RDS PostgreSQL | Data storage |
| `Storage` | GCP Cloud Storage | File uploads |
| `Secret` | Platform secrets manager | API keys, credentials |

### Usage

```typescript
import { Api, Database, Storage, Secret } from 'palindrom-ai/infra';

const db = new Database("Main");
const bucket = new Storage("Uploads");
const apiKey = new Secret("StripeApiKey");

const api = new Api("Backend", {
  link: [db, bucket, apiKey],
});
```

Refer to [palindrom-ai/infra](https://github.com/palindrom-ai/infra) for full documentation.