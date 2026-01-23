---
id: ci-cd
title: CI/CD & Deployment
category: operations
priority: 2
tags: [typescript, python, github-actions, pulumi, deployment]
---

## CI/CD & Deployment

Use the `palindrom-ai/github-actions` reusable workflows for all CI/CD.

### Requirements

- Use `palindrom-ai/github-actions` for all workflows — never write raw workflow YAML
- OIDC authentication to AWS (no static keys)
- Trunk-based development (merge to main)

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

All repos must use `check-my-toolkit` to validate against Palindrom standards:

```bash
pnpm add -D check-my-toolkit
```

This is run automatically in CI via the `lint` action.

### Environments

| Environment | Trigger |
|-------------|---------|
| `development` | Auto on push to main |
| `staging` | Auto after dev passes |
| `production` | Manual approval |

### Repository to AWS OU Mapping

Each project repository maps to exactly one AWS Organizational Unit (OU). Each OU contains three accounts: dev, stag, and prod. This creates clear ownership, deployment boundaries, and cost attribution.

**Project repositories** deploy infrastructure or applications. Each project repo maps to one OU and deploys only to its three accounts.

**Shared packages** are libraries consumed by other repositories. They contain no deployable infrastructure and do not map to any OU.

#### Structure

```
/project-api        →  Workloads OU  (dev/stag/prod)
/project-frontend   →  Workloads OU  (dev/stag/prod)
/data               →  Data OU       (dev/stag/prod)
/shared-utils       →  No OU (library only)
```

#### Cross-OU Access

When resources in one OU need access to another (e.g., application accessing data platform), use explicit cross-account IAM roles. This ensures dependencies are intentional and auditable.

#### Benefits

- **Clear ownership:** one repo, one team, one OU
- **Simple CI/CD:** each repo deploys to exactly three accounts
- **Cost tracking:** OU-level billing maps to teams/projects
- **Security boundaries:** environment isolation by default

#### OU Mapping Anti-Patterns

- ❌ One repo deploying to multiple OUs
- ❌ Shared packages containing infrastructure
- ❌ Implicit cross-account access without explicit IAM

### Deployment Flow

```
main → dev (auto) → staging (auto) → production (manual approval)
```

### Required Checks

All must pass before deploy:
- Lint
- Type check
- Tests
- Build
- Generated files up to date

### Rollback

- **Failed deploy:** Auto-rollback on failure
- **Bug in prod:** Revert commit or re-run previous successful deploy

### What NOT to Do

- Deploy from local machine
- Use long-lived AWS keys
- Write custom workflow YAML
- Skip checks
- Deploy directly to production

Refer to [palindrom-ai/github-actions](https://github.com/palindrom-ai/github-actions) for usage.
