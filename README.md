# Palindrom Standards

Composable coding standards for AI-assisted development.

## Structure

```
standards/
├── guidelines/     # Individual standards (Markdown with frontmatter)
├── rulesets/       # Tool configurations (TOML)
├── schemas/        # JSON schemas for validation
├── generator/      # Ruleset documentation generator
└── generated/      # Generated ruleset docs
```

## Guidelines

Guidelines are atomic standards covering one topic each. Each has frontmatter with metadata and tags for smart matching.

```yaml
---
id: database
title: Database
category: infrastructure
priority: 6
tags: [typescript, database, postgresql, drizzle, orm, backend]
---
```

| Guideline | Tags | Summary |
|-----------|------|---------|
| `auth` | typescript, python, auth, security, backend | Use `@palindrom/auth` |
| `api-contracts` | typescript, python, api, zod, pydantic, backend | Zod → OpenAPI → Pydantic |
| `backend-deployment` | typescript, python, gcp, cloud-run, cloud-functions, deployment, backend | Cloud Run for heavy, Cloud Functions for simple |
| `ci-cd` | typescript, python, github-actions, pulumi, deployment | GitHub Actions + Pulumi |
| `data-engineering` | python, databricks, pyspark, data, etl | Databricks + medallion architecture |
| `database` | typescript, database, postgresql, drizzle, orm, backend | RDS PostgreSQL + Drizzle ORM |
| `error-handling` | typescript, python, errors, backend | Structured errors with AppError |
| `frontend` | typescript, nextjs, react, frontend, vercel | Next.js + `palindrom-ai/ui` + Vercel |
| `llm-observability` | python, llm, langfuse, observability, ai | Langfuse via `palindrom-ai/llm` |
| `observability` | typescript, python, logging, observability, backend | SigNoz via `palindrom-ai/monitoring` |
| `secrets` | typescript, python, secrets, security, cloud | Platform secrets manager (AWS/GCP/Azure) |

## Rulesets

Tool configurations at different strictness levels:

| Ruleset | Language | Strictness |
|---------|----------|------------|
| `typescript-production` | TypeScript | Strict |
| `typescript-internal` | TypeScript | Medium |
| `typescript-prototype` | TypeScript | Relaxed |
| `python-production` | Python | Strict |
| `python-internal` | Python | Medium |
| `python-prototype` | Python | Relaxed |

Generate ruleset documentation:

```bash
pnpm generate
```

## Usage

This repo is consumed by the `@standards-kit/conform` MCP server, which dynamically composes relevant guidelines based on project context.

The MCP server:
1. Reads guideline metadata and tags
2. Matches guidelines to project context
3. Composes relevant standards into a single document
4. Returns to the AI agent

## Schemas

JSON schemas for validation:
- `schemas/guideline.schema.json` - Guideline frontmatter schema
- `schemas/ruleset.schema.json` - Ruleset TOML schema
