---
id: backend-deployment
title: Backend Deployment
category: infrastructure
priority: 3
tags: [typescript, python, gcp, cloud-run, cloud-functions, deployment, backend, pulumi, gcs]
author: Engineering Team
lastUpdated: "2026-03-02"
summary: "Deployment standards for backend services — GCP by default"
---

## Backend Deployment

Use the `progression-labs-dev/infra` package for all deployments.

### Primary Cloud

**GCP is our primary cloud.** All internal Progression Labs projects default to GCP services. When working inside a client's organisation, use whatever cloud that client uses.

### Requirements

- Use `progression-labs-dev/infra` for all infrastructure — never write raw Pulumi directly
- Default to GCP services unless there is a specific reason to use another provider
- All infrastructure changes go through the package
- Pulumi state backend must use GCS — never Pulumi Cloud or local file state

### Pulumi State Backend

**GCS is the required state backend for all Pulumi stacks.** Do not use Pulumi Cloud or local file state.

- Bucket naming convention: `{project}-pulumi-state-{env}` (e.g., `platform-pulumi-state-platform`, `brief-pulumi-state-dev`)
- One state bucket per project per environment
- Versioning must be enabled on state buckets (protects against accidental state corruption)
- When working in a client organisation, use their cloud's equivalent object storage (S3 for AWS, Azure Blob Storage for Azure)

### Installation

```bash
pnpm add progression-labs-dev/infra
```

### Cloud Selection

Default to GCP. Only use AWS/Azure when working in a client organisation that requires it, or for a specific service that GCP does not offer an equivalent for.

| Workload | Service | Notes |
|----------|---------|-------|
| APIs (Fastify) | GCP Cloud Run | Fast redeployments, scales to zero |
| Long-running LLM services | GCP Cloud Run | Fast redeployments, no timeout limits |
| Databases | GCP Cloud SQL | Managed PostgreSQL |
| File storage | GCP Cloud Storage | File uploads |
| Event-driven endpoints | GCP Cloud Functions | Simple triggers with no HTTP routing |
| Monitoring infrastructure (SigNoz) | GCP Compute Engine | Self-hosted observability stack |

### What the Package Provides

| Component | Service | Use Case |
|-----------|---------|----------|
| `Api` | GCP Cloud Run | Fastify APIs, LLM services |
| `Function` | GCP Cloud Functions | Event-driven endpoints (use `Api` for most workloads — Cloud Functions only for simple triggers with no HTTP routing) |
| `Database` | GCP Cloud SQL | Data storage (managed PostgreSQL) |
| `Storage` | GCP Cloud Storage | File uploads |
| `Secret` | GCP Secret Manager | API keys, credentials |

### Usage

```typescript
import { Api, Database, Storage, Secret } from 'progression-labs-dev/infra';

const db = new Database("Main");
const bucket = new Storage("Uploads");
const apiKey = new Secret("stripe-api-key");

const api = new Api("Backend", {
  link: [db, bucket, apiKey],
});
```

Refer to [progression-labs-dev/infra](https://github.com/progression-labs-dev/infra) for full documentation.