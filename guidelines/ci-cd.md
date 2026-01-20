---
id: ci-cd
title: CI/CD & Deployment
category: operations
priority: 2
---

## CI/CD & Deployment

All CI/CD runs on GitHub Actions. All deployments use SST (with Pulumi when SST doesn't support a resource).

### Requirements

- GitHub Actions for all CI/CD
- SST for infrastructure and deployment
- Pulumi within SST for unsupported resources
- OIDC authentication to AWS (no static keys)
- Trunk-based development (merge to main)

### Environments

| Environment | Trigger |
|-------------|---------|
| `development` | Auto on push to main |
| `staging` | Auto after dev passes |
| `production` | Manual approval |

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

- **Failed deploy:** SST auto-rollbacks
- **Bug in prod:** Revert commit or re-run previous successful deploy

### What NOT to Do

- Deploy from local machine
- Use long-lived AWS keys
- Skip checks
- Deploy directly to production
