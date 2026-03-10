# Progression Labs Standards

Composable coding standards for AI-assisted development.

## Structure

```
standards/
├── guidelines/     # Individual standards (Markdown with frontmatter)
└── rulesets/       # Tool configurations (TOML)
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

| Guideline | Category | Tags | Summary |
|-----------|----------|------|---------|
| `auth` | security | typescript, python, auth, security, backend | Authentication patterns and session management standards |
| `backend-deployment` | infrastructure | typescript, python, gcp, aws, cloud-run, cloud-functions, deployment, backend, gcs | Deployment standards for backend services on GCP and AWS |
| `ci-cd` | operations | typescript, python, github-actions, pulumi, deployment, aws, gcp | CI/CD pipeline standards using GitHub Actions and Pulumi |
| `conventions` | architecture | typescript, python, json, api, backend, frontend | Data format conventions for JSON, dates, IDs, and naming |
| `data-engineering` | data | python, pyspark, data, etl, s3, aws | Data engineering standards for ETL pipelines and PySpark |
| `database` | infrastructure | typescript, database, postgresql, drizzle, orm, backend | Database standards for PostgreSQL, Drizzle ORM, and migrations |
| `frontend` | architecture | typescript, nextjs, react, frontend, vercel | Frontend architecture standards for Next.js and React |
| `llm` | operations | python, llm, langfuse, observability, ai, rag, evals | Standards for LLM services, RAG pipelines, and AI observability |
| `monorepo` | architecture | typescript, pnpm, monorepo | Monorepo structure and pnpm workspace standards |
| `observability` | operations | typescript, python, logging, observability, backend | Logging, tracing, and monitoring standards |
| `python` | architecture | python, uv, pydantic, ruff, llm, livekit-agent | Python language standards for LLM and data services |
| `repository` | architecture | repository, metadata, standards | Repository metadata, structure, and documentation standards |
| `rest-apis` | architecture | typescript, python, api, zod, pydantic, backend | REST API design standards including validation and error handling |
| `secrets` | security | typescript, python, security, infrastructure, gcp, aws, secrets, deployment | Standards for creating, storing, and accessing secrets across all environments |
| `testing` | architecture | typescript, python, testing, unit, integration, e2e | Testing standards for unit, integration, and e2e tests |
| `typescript` | architecture | typescript, nodejs, pnpm, eslint, backend, frontend | TypeScript language and tooling standards for all services |

## Rulesets

Tool configurations at different strictness levels:

| Ruleset | Language | Strictness |
|---------|----------|------------|
| `typescript-production` | TypeScript | Strict |
| `typescript-internal` | TypeScript | Medium |
| `typescript-prototype` | TypeScript | Relaxed |
| `typescript-frontend-production` | TypeScript (Frontend) | Strict |
| `typescript-frontend-internal` | TypeScript (Frontend) | Medium |
| `python-production` | Python | Strict |
| `python-internal` | Python | Medium |
| `python-prototype` | Python | Relaxed |

## Validation

Validate guidelines and rulesets using `@progression-labs-dev/conform`:

```bash
npx @progression-labs-dev/conform validate registry       # Validate rulesets/*.toml
npx @progression-labs-dev/conform validate guidelines ./guidelines  # Validate guideline frontmatter
```

## Repository Docs Contract

Repos extending `base-internal`, `base-production`, or `base-prototype` must include these files:

- `README.md`
- `CLAUDE.md`
- `docs/ARCHITECTURE.md`
- `docs/FEATURES.md`

Required frontmatter:

`docs/ARCHITECTURE.md`

```yaml
---
type: architecture
title: <Doc title>
owner: <owner-slug>
last_reviewed: YYYY-MM-DD
tracks: <path-or-scope>
---
```

`docs/FEATURES.md`

```yaml
---
type: features
title: <Doc title>
owner: <owner-slug>
last_reviewed: YYYY-MM-DD
---
```

Additional requirements:

- `docs/ARCHITECTURE.md` must contain an `Overview` section
- markdown files outside `docs/` must be explicitly allowlisted in the repo's `standards.toml`

## Usage

This repo is consumed by the `@progression-labs-dev/conform` MCP server, which dynamically composes relevant guidelines based on project context.

The MCP server:
1. Reads guideline metadata and tags
2. Matches guidelines to project context
3. Composes relevant standards into a single document
4. Returns to the AI agent
