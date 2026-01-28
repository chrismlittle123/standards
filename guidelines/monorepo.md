---
id: monorepo
title: Monorepo
category: architecture
priority: 4
tags: [typescript, turborepo, pnpm, monorepo]
---

## Monorepo

All monorepos use Turborepo with pnpm workspaces.

### Stack

| Tool | Purpose |
|------|---------|
| Turborepo | Task orchestration, caching |
| pnpm workspaces | TypeScript package management |
| uv | Python package management |

### Requirements

- Use Turborepo for all monorepos (works with multiple languages)
- Use pnpm workspaces for TypeScript package linking
- Use uv for Python dependencies
- Enable remote caching in CI (via Vercel)
- Never use npm or yarn

### Standard Structure

```
my-monorepo/
├── apps/
│   ├── web/              # Next.js frontend
│   │   └── standards.toml    # Project-specific standards
│   ├── api/              # Fastify backend
│   │   └── standards.toml    # Project-specific standards
│   └── admin/            # Admin dashboard
│       └── standards.toml    # Project-specific standards
├── packages/
│   ├── ui/               # Shared UI components
│   ├── db/               # Drizzle schema & client
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared ESLint, TS configs
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── standards.toml            # Root standards (metadata & processes)
```

### standards.toml Configuration

Monorepos require **two levels** of standards.toml:

1. **Root `standards.toml`** - Defines metadata and processes
2. **Per-project `standards.toml`** - Defines code quality standards and tool enforcement

**Root standards.toml (metadata & processes):**
```toml
[metadata]
name = "my-monorepo"
type = "monorepo"
description = "Description of the monorepo"

[processes]
ci = "turbo run lint test build"
deploy = "turbo run deploy"
```

**Project standards.toml (code quality & tools):**
```toml
[metadata]
name = "web"
type = "typescript-frontend"
tier = "production"

[tools.eslint]
enabled = true
config = "../../packages/config/eslint"

[tools.typescript]
enabled = true
strict = true

[tools.prettier]
enabled = true
```

Each app and package that contains source code should have its own `standards.toml` defining:
- The tier (prototype, internal, production)
- Enabled linting/formatting tools
- Tool-specific configuration

### Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Run all apps in dev mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint everything
pnpm test             # Test everything
```

### Multi-Language Support

For monorepos with both TypeScript and Python:

```
my-monorepo/
├── apps/
│   ├── web/              # Next.js (pnpm)
│   └── api/              # Fastify (pnpm)
├── packages/
│   └── shared/           # Shared types (pnpm)
├── python/
│   └── llm-service/      # Python LLM service (uv)
├── turbo.json
├── pnpm-workspace.yaml
└── pyproject.toml        # Root Python config
```

Turborepo orchestrates tasks across both ecosystems.

### Why Turborepo

- Intelligent caching (never rebuild unchanged packages)
- Parallel task execution
- Remote caching for CI
- Simple configuration (single `turbo.json`)
- Works with pnpm workspaces and uv
