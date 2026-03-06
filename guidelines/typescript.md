---
id: typescript
title: TypeScript
category: architecture
priority: 1
tags: [typescript, nodejs, pnpm, eslint, backend, frontend]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "TypeScript language and tooling standards for all services"
---

## TypeScript

TypeScript is the default language for almost everything.

### When to Use TypeScript

| Use Case | Example |
|----------|---------|
| Backend APIs | Fastify services on GCP Cloud Run |
| GCP Cloud Functions | Event-driven endpoints, webhooks |
| Frontend | Next.js applications |
| Infrastructure | Pulumi |
| Configuration | ESLint, build tools |
| CLI tools | Internal tooling |
| Shared packages | `progression-labs-development/auth`, `progression-labs-development/fastify-api` |

### When NOT to Use TypeScript

Use Python instead for:

- `progression-labs-development/llm` — LLM services
- `progression-labs-development/livekit-agent` — Voice/video agents
- **GCP Cloud Functions** — Data engineering, ETL triggers

See [Python guideline](./python.md) for those cases.

### Stack

| Tool | Purpose |
|------|---------|
| Node.js 22 LTS | Runtime |
| pnpm | Package manager |
| TypeScript 5.4+ | Language |
| ESLint | Linting |
| Knip | Dead code detection |
| Husky | Git hooks (pre-push, commit-msg) |

### Naming Conventions

- Use `kebab-case` for file names (e.g., `user-service.ts`, `api-client.ts`)
- Use `kebab-case` for folder names (e.g., `user-management/`, `api-handlers/`)
- This applies to React components too (e.g., `user-profile.tsx`, not `UserProfile.tsx`)

### Requirements

- Use strict TypeScript (`strict: true`)
- Use pnpm (not npm or yarn)
- Use ESLint for linting
- Use `@progression-labs-development/conform` to enforce standards
- See [Testing guideline](./testing.md) for test structure

### Constants

Never hard-code values that may need to change. Define constants for replaceability.

```typescript
// Bad - magic number
if (retries > 3) { ... }

// Good - named constant
const MAX_RETRIES = 3;
if (retries > MAX_RETRIES) { ... }
```

This applies to:
- Numeric thresholds and limits
- URL endpoints and API paths
- Configuration values
- Error messages that may need translation
- Any value that appears more than once

### Standards Enforcement

Use `@progression-labs-development/conform` to enforce Progression Labs standards.

```bash
pnpm add -D @progression-labs-development/conform
```

Each project needs a `standards.toml` that specifies which code ruleset to use:

```toml
[standards]
ruleset = "typescript-production"  # or typescript-internal, typescript-prototype
```

Available code rulesets:
- `typescript-production` — Customer-facing services (strictest)
- `typescript-internal` — Internal tools and services
- `typescript-prototype` — Experimental projects (most relaxed)

For frontend projects, use the frontend-specific rulesets instead — see [Frontend guideline](./frontend.md).

The root `standards.toml` handles process standards (commits, hooks, branch protection) separately — see [Repository guideline](./repository.md).

Run in CI to validate project structure and configuration against Progression Labs standards.