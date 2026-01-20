<!-- AUTO-GENERATED — DO NOT EDIT -->
<!-- Profile: TypeScript Backend API -->
<!-- Run "pnpm generate:profiles" to update -->

# TypeScript Backend API

Standards for TypeScript services exposing REST APIs

---

You are working on a TypeScript backend service that exposes a REST API.
Follow these guidelines strictly when writing or reviewing code.

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

## Error Handling

Use structured error handling with proper error types and consistent responses.

### Requirements

- Define domain-specific error classes that extend a base `AppError`
- Include error codes, HTTP status, and user-safe messages
- Never expose stack traces or internal details in production responses
- Log full error context server-side before sanitizing for clients

### Example

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

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

## API Contracts

All APIs must use the standard base packages with Zod as the single source of truth.

### Requirements

- Use `@palindrom/fastify-base` for TypeScript APIs (Fastify)
- Use `palindrom-ai/llm` for Python LLM APIs (FastAPI)
- Define all schemas in Zod (TypeScript)
- Generate OpenAPI from Zod, generate Pydantic from OpenAPI
- Check generated files into version control
- CI validates generated files are up to date

### Type Flow

```
Zod schemas ──► fastify-base ──► openapi.yaml ──► llm package ──► Pydantic
```

### Installation

**TypeScript:**
```bash
pnpm add @palindrom/fastify-base
```

**Python:**
```bash
pip install palindrom-llm
```

### Generation Commands

```bash
pnpm generate:types        # Generate OpenAPI + Pydantic
pnpm generate:types --check # CI validation (fails if drift)
```

### Error Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "requestId": "req_abc123"
  }
}
```

### Zod Example

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;
```

This generates TypeScript types, OpenAPI schemas, and Pydantic models.

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

## Database

All databases use RDS PostgreSQL with Drizzle ORM.

### Stack

- RDS PostgreSQL
- Drizzle ORM
- Drizzle Kit for migrations

### Requirements

- All database access through Drizzle ORM
- Connection strings stored in AWS Secrets Manager
- Separate databases per environment (dev, staging, production)
- No direct database access from frontend

### Migrations

Run migrations with Drizzle Kit:

```bash
pnpm drizzle-kit generate  # Generate migration
pnpm drizzle-kit migrate   # Apply migration
```

Migrations are checked into version control and run in CI/CD before deployment.

---

## Backend Deployment

All backends deploy to AWS via SST. Choose the right compute for your workload.

### When to Use What

| Workload | Compute | Why |
|----------|---------|-----|
| LLM services, long requests | ECS Fargate | No cold starts, no timeout limits |
| Simple APIs, low traffic | Lambda | Scales to zero, cost effective |

### ECS Fargate (Heavy Workloads)

For LLM services and APIs with long-running requests:

```typescript
// sst.config.ts
new Service(stack, "api", {
  path: ".",
  port: 3000,
  cpu: "0.5 vCPU",
  memory: "1 GB",
  scaling: {
    minContainers: 1,
    maxContainers: 4,
  },
});
```

Requires a `Dockerfile` in the project root.

### Lambda (Simple APIs)

For simple, low-traffic APIs:

```typescript
// sst.config.ts
new Function(stack, "api", {
  handler: "src/index.handler",
  runtime: "nodejs20.x",
  timeout: "30 seconds",
});
```

### Docker

ECS deployments require a Dockerfile:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["node", "dist/index.js"]
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
