---
id: ci-cd
title: CI/CD & Deployment
category: operations
priority: 2
tags: [typescript, python, github-actions, pulumi, deployment, gcp]
author: Engineering Team
lastUpdated: "2026-03-02"
summary: "CI/CD pipeline standards using GitHub Actions and Pulumi"
---

## CI/CD & Deployment

Use the `progression-labs-development/github-actions` reusable workflows for all CI/CD.

### Requirements

- Use `progression-labs-development/github-actions` reusable actions for CI workflows (lint, test, build, standards checks)
- Infrastructure deployments must use the `deploy` reusable action from `progression-labs-development/github-actions`
- Publish workflows may use custom YAML but must follow OIDC patterns below
- OIDC authentication to GCP (no static keys). When working in a client org, use their cloud's OIDC equivalent
- Branch-per-environment strategy (dev/stag/prod branches) for service repos

### What the Package Provides

| Action | Purpose |
|--------|---------|
| `lint` | Run linting and standards checks |
| `test` | Run tests with coverage reporting |
| `build` | Build TypeScript/Python packages |
| `deploy` | Deploy via Pulumi with OIDC auth |
| `publish-npm` | Publish packages to npm registry |
| `docker-build` | Build and push Docker images |

### Standards Enforcement

All repos must use `@progression-labs-development/conform` to validate against Progression Labs standards:

```bash
pnpm add -D @progression-labs-development/conform
```

This is run automatically in CI via the `lint` action.

### Git & Branching Strategy

**Deployment repos** (APIs, frontends, infrastructure) use branches that mirror environments:

| Branch | Environment |
|--------|-------------|
| `dev` | Development — active work, may break |
| `stag` | Staging — pre-production, mirrors prod |
| `prod` | Production — what users see |

Set `dev` as the default branch in GitHub so PRs target it by default. Merging up (`dev → stag → prod`) promotes code through environments.

**Library repos** (shared packages) use `main` only with standard PR flow. They publish to npm/PyPI on merge — no environment branches needed.

#### Prototype Phase

New projects start simple — just `prod` branch, no extra branches, no ceremony. Ship fast. Graduate to the full `dev → stag → prod` flow once you have users.

### Backend Deployment

All Pulumi deployments must use the `deploy` reusable action from `progression-labs-development/github-actions`. Do not write custom deployment workflow YAML for Pulumi — the `deploy` action handles OIDC auth, state backend configuration, and environment targeting.

| Branch | URL | GCP Project |
|--------|-----|-------------|
| `dev` | dev.yourapp.com | Dev |
| `stag` | stag.yourapp.com | Stag |
| `prod` | yourapp.com | Prod |

Each branch auto-deploys to its matching environment with branch-specific environment variables pointing to the corresponding GCP project. Branch names match environment names match GCP projects — no confusion.

### Frontend Deployment

Frontends deploy to Vercel. The same branch strategy applies:

- **Production branch:** `prod`
- **Preview branches:** `dev`, `stag`, feature branches
- Assign custom domains to each branch
- Set environment variables per branch (API URLs, feature flags)

### Repository to GCP Project Mapping

Each project repository maps to a set of GCP projects — one per environment (dev, stag, prod). This creates clear ownership, deployment boundaries, and cost attribution.

**Project repositories** deploy infrastructure or applications. Each project repo deploys to its own set of GCP projects.

**Shared packages** are libraries consumed by other repositories. They contain no deployable infrastructure and do not map to any GCP project.

#### Structure

```
/project-api        →  project-api-dev, project-api-stag, project-api-prod
/project-frontend   →  project-frontend-dev, project-frontend-stag, project-frontend-prod
/data               →  data-dev, data-stag, data-prod
/shared-utils       →  No GCP project (library only)
```

#### Cross-Project Access

When resources in one project need access to another (e.g., application accessing data platform), use explicit cross-project IAM bindings. This ensures dependencies are intentional and auditable.

#### Benefits

- **Clear ownership:** one repo, one team, one set of GCP projects
- **Simple CI/CD:** each repo deploys to exactly three projects
- **Cost tracking:** project-level billing maps to teams/projects
- **Security boundaries:** environment isolation by default

#### Anti-Patterns

- One repo deploying to multiple unrelated project sets
- Shared packages containing infrastructure
- Implicit cross-project access without explicit IAM

### Deployment Flow

```
dev → stag → prod
```

Merging up promotes code through environments. Each branch auto-deploys to its matching environment.

### Required Checks

All must pass before deploy:
- Lint
- Type check
- Tests
- Build
- Generated files up to date

### Rollback

- **Failed deploy:** Auto-rollback on failure
- **Bug in prod:** Revert the merge to prod or re-run previous successful deploy

### What NOT to Do

- Deploy from local machine
- Use long-lived service account keys
- Write custom CI workflow YAML for lint/test/build (use reusable actions)
- Write custom deployment YAML for Pulumi (use the `deploy` reusable action)
- Skip checks
- Push directly to prod (always go through dev → stag first)

Refer to [progression-labs-development/github-actions](https://github.com/progression-labs-development/github-actions) for usage.