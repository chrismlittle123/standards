# CI/CD & Deployment

**Status:** Standard

---

## Overview

All CI/CD runs on **GitHub Actions**. All deployments use **SST** (with **Pulumi** for resources SST doesn't support natively).

---

## Environments

| Environment | Purpose | Deployment Trigger |
|-------------|---------|-------------------|
| `development` | Active development, may be unstable | Push to `main` |
| `staging` | Pre-production testing | Auto after dev passes |
| `production` | Live | Manual approval |

---

## Branch Strategy

**Trunk-based development** — all work merges to `main`.

```
Push to main
    │
    ▼
┌─────────────────┐
│   Development   │ ◄── Auto-deploy
└────────┬────────┘
         │ Tests pass
         ▼
┌─────────────────┐
│    Staging      │ ◄── Auto-promote
└────────┬────────┘
         │ Manual approval
         ▼
┌─────────────────┐
│   Production    │ ◄── Deploy on approval
└─────────────────┘
```

---

## Workflow Structure

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy-dev:
    needs: checks
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: eu-west-2
      - run: pnpm install
      - run: pnpm sst deploy --stage dev

  deploy-staging:
    needs: deploy-dev
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: eu-west-2
      - run: pnpm install
      - run: pnpm sst deploy --stage staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: eu-west-2
      - run: pnpm install
      - run: pnpm sst deploy --stage production
```

---

## Required Checks

All must pass before deployment:

- Lint (`pnpm lint`)
- Type check (`pnpm type-check`)
- Unit tests (`pnpm test`)
- Build (`pnpm build`)
- Generated files up to date (`pnpm generate:types --check`)

Additional checks may be defined per-project in the workflow.

---

## Infrastructure

### SST (Primary)

Use SST for all supported resources:

```typescript
// sst.config.ts
export default $config({
  app(input) {
    return {
      name: 'my-service',
      region: 'eu-west-2',
    };
  },
  async run() {
    const api = new sst.aws.Function('Api', {
      handler: 'src/index.handler',
    });
    return { url: api.url };
  },
});
```

### Pulumi (When SST Doesn't Support)

For resources SST doesn't support natively, use Pulumi within SST:

```typescript
// sst.config.ts
import * as aws from '@pulumi/aws';

export default $config({
  async run() {
    // SST resource
    const api = new sst.aws.Function('Api', { ... });

    // Pulumi resource (when SST doesn't have native support)
    const customResource = new aws.something.Resource('Custom', { ... });

    return { url: api.url };
  },
});
```

---

## Rollback

### On Failed Deploy

SST automatically rolls back failed deployments. No action needed.

### On Bug in Production

1. **Option A: Revert commit**
   ```bash
   git revert HEAD
   git push origin main
   ```
   Triggers new deploy through the pipeline.

2. **Option B: Redeploy previous**
   - Go to GitHub Actions
   - Find last successful production deploy
   - Click "Re-run all jobs"

---

## GitHub Environments

Configure these environments in GitHub repository settings:

| Environment | Protection Rules |
|-------------|-----------------|
| `development` | None |
| `staging` | None (auto-deploys after dev) |
| `production` | Required reviewers (1+) |

Each environment should have:
- `AWS_ROLE_ARN` variable (OIDC role for that environment)

---

## What NOT to Do

| Don't | Do Instead |
|-------|------------|
| Deploy from local machine | Deploy via GitHub Actions |
| Use long-lived AWS keys | Use OIDC |
| Skip checks to deploy faster | Fix the failing checks |
| Deploy directly to production | Go through dev → staging first |
| Create custom deploy scripts | Use SST |

---

## Local Development

For local SST dev mode:

```bash
aws sso login --profile palindrom
pnpm sst dev
```

This runs your functions locally with live AWS resources.
