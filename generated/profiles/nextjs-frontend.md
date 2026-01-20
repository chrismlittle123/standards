<!-- AUTO-GENERATED — DO NOT EDIT -->
<!-- Profile: Next.js Frontend -->
<!-- Run "pnpm generate:profiles" to update -->

# Next.js Frontend

Standards for Next.js frontend applications deployed to Vercel

---

You are working on a Next.js frontend application.
Follow these guidelines strictly when writing or reviewing code.
Use palindrom-ai/ui for all components. Keep business logic in backend services.

---

## Authentication

All authentication must use the `@palindrom/auth` package.

### Requirements

- Use `@palindrom/auth` for all authentication — never integrate Clerk directly
- Enable only the auth methods your project needs (Google, Microsoft, Email/Password)
- MFA is optional and configured per-project
- Refer to the [palindrom-ai/auth](https://github.com/palindrom-ai/auth) repository for implementation details

### Installation

```bash
pnpm add @palindrom/auth
```

### Supported Methods

| Method | Status |
|--------|--------|
| Google OAuth | Supported |
| Microsoft OAuth | Supported |
| Email/Password | Supported |
| Magic Links | Available |
| MFA | Optional |

### Deviations

If your project needs auth features not in `@palindrom/auth`, extend the package rather than bypassing it. Document any project-specific deviations in an ADR.

---

## Secrets Management

All secrets must be stored in AWS Secrets Manager. No local `.env` files.

### Requirements

- No `.env` files — never store secrets locally
- All secrets in AWS Secrets Manager
- Local dev authenticates via AWS SSO
- CI/CD authenticates via OIDC (no static keys)

### Local Development

```bash
aws sso login --profile palindrom
```

Secrets are loaded automatically by the base packages.

### GitHub Actions

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::ACCOUNT_ID:role/github-actions
      aws-region: eu-west-2
```

### Secret Naming

```
{service}/{environment}
```

Examples: `api/production`, `llm-service/staging`

### What NOT to Do

- Create `.env` files
- Store AWS access keys in GitHub
- Commit secrets to git
- Share secrets via Slack

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

---

## Observability

All application observability must use the `@palindrom/logging` package (Better Stack).

### Requirements

- Use `@palindrom/logging` for all logging and error tracking — never integrate Better Stack directly
- Use structured JSON logging with consistent fields
- Include `requestId` in all log entries for correlation
- Never log secrets, passwords, or unmasked API keys

### Installation

```bash
pnpm add @palindrom/logging
```

### Required Log Fields

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp |
| `level` | debug, info, warn, error |
| `message` | Human-readable message |
| `requestId` | Correlation ID |
| `service` | Service name |
| `environment` | development, staging, production |

### Log Levels

| Level | Use For |
|-------|---------|
| `debug` | Development only |
| `info` | Normal operations |
| `warn` | Recoverable issues |
| `error` | Failures requiring attention |

Refer to [palindrom-ai/logging](https://github.com/palindrom-ai/logging) for implementation details.

---

## Frontend

All frontends use Next.js with the `palindrom-ai/ui` component library.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `palindrom-ai/ui` (shadcn/ui-based components)
- Vercel for deployment

### Architecture

Frontend and backend are always separate:

- Separate repositories
- Separate deployments
- Frontend calls backend APIs — no business logic in Next.js

### API Routes

Only allowed as a thin BFF layer:

- Auth token exchange
- Aggregating backend calls
- Proxying to avoid CORS

**Not allowed:** Business logic, database access, anything requiring unit tests.

### Components

Use `palindrom-ai/ui` for all components. For new components, extend the library rather than adding one-off components to your project.

```bash
pnpm add palindrom-ai/ui
```

---

## Code Quality Rules

## Code

### Linting

#### Eslint

#### Rules

| Rule | Config |
|------|--------|
| `max-depth` | { severity: error, max: 4 } |
| `max-params` | { severity: error, max: 4 } |
| `max-lines-per-function` | `error` |
| `max-lines` | `error` |
| `complexity` | `error` |
| `no-console` | { severity: error, allow: error,warn } |
| `eqeqeq` | `error` |
| `curly` | `error` |
| `prefer-const` | `error` |
| `no-var` | `error` |
| `no-eval` | `error` |
| `no-implied-eval` | `error` |
| `array-callback-return` | `error` |
| `no-template-curly-in-string` | `error` |
| `consistent-return` | `error` |
| `import/no-cycle` | { severity: error, maxDepth: 10 } |
| `@typescript-eslint/no-unused-vars` | `error` |
| `@typescript-eslint/no-explicit-any` | `error` |
| `@typescript-eslint/no-non-null-assertion` | `error` |
| `@typescript-eslint/no-unnecessary-condition` | `error` |
| `@typescript-eslint/no-unsafe-assignment` | `error` |
| `@typescript-eslint/no-unsafe-call` | `error` |
| `@typescript-eslint/no-unsafe-member-access` | `error` |
| `@typescript-eslint/no-unsafe-return` | `error` |
| `@typescript-eslint/no-floating-promises` | `error` |
| `@typescript-eslint/no-misused-promises` | `error` |
| `@typescript-eslint/await-thenable` | `error` |
| `@typescript-eslint/switch-exhaustiveness-check` | `error` |

### Formatting

#### Prettier

- **enabled**: `true`

### Types

#### Tsc

#### Require

| Option | Value |
|--------|-------|
| `strict` | `true` |
| `noImplicitAny` | `true` |
| `strictNullChecks` | `true` |
| `noUnusedLocals` | `true` |
| `noImplicitReturns` | `true` |
| `noFallthroughCasesInSwitch` | `true` |
| `esModuleInterop` | `true` |
| `skipLibCheck` | `true` |
| `forceConsistentCasingInFileNames` | `true` |

### Security

#### Secrets

- **enabled**: `true`

#### Pnpmaudit

- **enabled**: `true`

### Unused

#### Knip

- **enabled**: `true`

### Naming

- **enabled**: `true`
- **rules**: `[object Object]`

### Quality

#### Disable Comments

- **enabled**: `true`
