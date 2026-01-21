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
| AWS Lambda functions | API handlers, webhooks |
| Backend APIs | Fastify services |
| Frontend | Next.js applications |
| Infrastructure | SST config, Pulumi |
| Configuration | ESLint, Prettier, build tools |
| CLI tools | Internal tooling |
| Shared packages | `palindrom-ai/auth`, `palindrom-ai/logging` |

### When NOT to Use TypeScript

Only use Python when you need an existing Python `palindrom-ai/` package:

- `palindrom-ai/llm` — LLM services
- `palindrom-ai/databricks-utils` — Data pipelines
- `palindrom-ai/livekit-agents` — Voice/video agents

See [Python guideline](./python.md) for those cases.

### Stack

| Tool | Purpose |
|------|---------|
| Node.js 22 LTS | Runtime |
| pnpm | Package manager |
| TypeScript 5.4+ | Language |
| Biome | Linting & formatting |

### Requirements

- Use strict TypeScript (`strict: true`)
- Use pnpm (not npm or yarn)
- Use Biome for linting and formatting
- Prefer `type` over `interface` for consistency
