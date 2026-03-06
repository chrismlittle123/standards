---
id: monorepo
title: Monorepo
category: architecture
priority: 4
tags: [typescript, python, pnpm, uv, monorepo]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Monorepo structure and pnpm workspace standards"
---

## Monorepo

All monorepos use pnpm workspaces.

### Stack

| Tool | Purpose |
|------|---------|
| pnpm workspaces | Package management, task orchestration |
| uv | Python package management |

### Requirements

- Use pnpm workspaces for package management and task orchestration
- Use uv for Python dependencies
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
├── pnpm-workspace.yaml
├── package.json
└── standards.toml            # Root standards (metadata & processes)
```

### standards.toml Configuration

Monorepos require **two levels** of standards.toml:

1. **Root `standards.toml`** — Process standards (commits, hooks, branch protection). Uses a `base-*` ruleset.
2. **Per-project `standards.toml`** — Code standards (linting, types, security). Uses a language-specific ruleset.

**Root standards.toml (process):**
```toml
[standards]
ruleset = "base-production"
```

**Per-project standards.toml (code):**
```toml
[standards]
ruleset = "typescript-frontend-production"
```

Each app and package that contains source code should have its own `standards.toml` referencing the appropriate code ruleset for its language and tier.

### Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
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
├── pnpm-workspace.yaml
└── pyproject.toml        # Root Python config
```