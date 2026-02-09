
## TypeScript

TypeScript is the default language for almost everything.

### When to Use TypeScript

| Use Case | Example |
|----------|---------|
| AWS Lambda functions | API handlers, webhooks |
| Backend APIs | Fastify services |
| Frontend | Next.js applications |
| Infrastructure | Pulumi |
| Configuration | ESLint, build tools |
| CLI tools | Internal tooling |
| Shared packages | `palindrom-ai/auth`, `palindrom-ai/monitoring` |

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

### Standards Enforcement

```bash
pnpm add -D @standards-kit/conform
```

Run `@standards-kit/conform` in CI to validate project structure and configuration against Palindrom standards.
