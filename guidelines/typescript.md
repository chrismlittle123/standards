---
id: typescript
title: TypeScript
category: architecture
priority: 1
tags: [typescript, nodejs, backend, frontend]
author: Engineering Team
lastUpdated: "2024-03-15"
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
| Shared packages | `palindrom-ai/auth`, `palindrom-ai/monitoring` |

### When NOT to Use TypeScript

Use Python instead for:

- `palindrom-ai/llm` — LLM services
- `palindrom-ai/livekit-agents` — Voice/video agents
- **AWS Lambda functions** — Data engineering, ETL triggers (Python Lambda ecosystem is mature)

See [Python guideline](./python.md) for those cases.

### Stack

| Tool | Purpose |
|------|---------|
| Node.js 22 LTS | Runtime |
| pnpm | Package manager |
| TypeScript 5.4+ | Language |
| ESLint | Linting |

### Naming Conventions

- Use `kebab-case` for file names (e.g., `user-service.ts`, `api-client.ts`)
- Use `kebab-case` for folder names (e.g., `user-management/`, `api-handlers/`)
- This applies to React components too (e.g., `user-profile.tsx`, not `UserProfile.tsx`)

### Requirements

- Use strict TypeScript (`strict: true`)
- Use pnpm (not npm or yarn)
- Use ESLint for linting
- Use `@standards-kit/conform` to enforce standards
- Prefer `type` over `interface` for consistency
- Max 400 lines per file, 50 lines per function
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

Use `@standards-kit/conform` to enforce Palindrom standards.

```bash
pnpm add -D @standards-kit/conform
```

Every repository must have a `standards.toml` in the root that specifies which ruleset to use:

```toml
[standards]
ruleset = "typescript-production"  # or typescript-internal, typescript-prototype
```

Available rulesets:
- `typescript-production` — Customer-facing services (strictest)
- `typescript-internal` — Internal tools and services
- `typescript-prototype` — Experimental projects (most relaxed)

Run in CI to validate project structure and configuration against Palindrom standards.