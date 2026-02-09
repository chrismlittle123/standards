
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

All repos must use `@standards-kit/conform` to validate against Palindrom standards:

```bash
pnpm add -D @standards-kit/conform
```

This is run automatically in CI via the `lint` action.

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

- **Failed deploy:** Auto-rollback on failure
- **Bug in prod:** Revert commit or re-run previous successful deploy

### What NOT to Do

- Deploy from local machine
- Use long-lived AWS keys
- Write custom workflow YAML
- Skip checks
- Deploy directly to production

Refer to [palindrom-ai/github-actions](https://github.com/palindrom-ai/github-actions) for usage.
