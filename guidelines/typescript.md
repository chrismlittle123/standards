---
id: typescript
title: TypeScript
category: architecture
priority: 1
tags: [typescript, nodejs, backend, frontend]
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
- Use `check-my-toolkit` to enforce standards
- Prefer `type` over `interface` for consistency
- Max 400 lines per file, 50 lines per function

### Test Structure

Tests must be in a standalone `tests/` folder at the project root, never next to the source code.

```
project/
├── src/
│   └── ...
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

### Standards Enforcement

Use `check-my-toolkit` to enforce Palindrom standards.

```bash
pnpm add -D check-my-toolkit
```

Every repository must have a `check.toml` in the root that specifies which ruleset to use:

```toml
[check-my-toolkit]
ruleset = "typescript-production"  # or typescript-internal, typescript-prototype
```

Available rulesets:
- `typescript-production` — Customer-facing services (strictest)
- `typescript-internal` — Internal tools and services
- `typescript-prototype` — Experimental projects (most relaxed)

Run in CI to validate project structure and configuration against Palindrom standards.
