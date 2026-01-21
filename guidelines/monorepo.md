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
| pnpm workspaces | Package management |

### Requirements

- Use Turborepo for all monorepos
- Use pnpm workspaces for package linking
- Enable remote caching in CI (via Vercel)
- Never use npm or yarn in monorepos

### Standard Structure

```
my-monorepo/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Fastify backend
│   └── admin/            # Admin dashboard
├── packages/
│   ├── ui/               # Shared UI components
│   ├── db/               # Drizzle schema & client
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared ESLint, TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

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

### Why Turborepo

- Intelligent caching (never rebuild unchanged packages)
- Parallel task execution
- Remote caching for CI
- Simple configuration (single `turbo.json`)
- Works with pnpm workspaces
