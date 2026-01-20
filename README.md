# Palindrom Standards

Composable coding standards for AI-assisted development.

## Quick Start

```bash
# Generate all outputs
pnpm generate

# Generate only profiles
pnpm generate:profiles

# Generate only rulesets
pnpm generate:rulesets
```

## Structure

```
standards/
├── guidelines/     # Individual standards (Markdown)
├── profiles/       # Composition configs (TOML)
├── rulesets/       # Tool configurations (TOML)
├── generator/      # Build tool
├── dist/           # Generated output
└── docs/           # Reference docs & ideas
```

## How It Works

**Guidelines** are individual standards covering one topic each (auth, secrets, observability, etc.)

**Profiles** compose guidelines + rulesets into a single document for a project type.

**Rulesets** define tool configurations (ESLint, TSC, Ruff, MyPy).

```
guidelines/*.md  ─┐
                  ├──► generator ──► dist/profiles/*.md
profiles/*.toml  ─┤
                  │
rulesets/*.toml ──┴──► generator ──► dist/rulesets/*.md
```

## Profiles

| Profile | Use For |
|---------|---------|
| `typescript-backend-api` | Fastify REST APIs |
| `llm-service` | Python FastAPI + LLM services |
| `python-data-pipeline` | Databricks data pipelines |
| `nextjs-frontend` | Next.js frontend apps |

## Guidelines

| Guideline | Summary |
|-----------|---------|
| `auth` | Use `@palindrom/auth` |
| `api-contracts` | Zod → OpenAPI → Pydantic |
| `backend-deployment` | ECS Fargate for heavy, Lambda for simple |
| `ci-cd` | GitHub Actions + SST |
| `database` | RDS PostgreSQL + Drizzle ORM |
| `data-engineering` | Databricks + medallion architecture |
| `error-handling` | Structured errors with AppError |
| `frontend` | Next.js + `palindrom-ai/ui` + Vercel |
| `llm-observability` | Langfuse via `palindrom-ai/llm` |
| `observability` | Better Stack via `@palindrom/logging` |
| `secrets` | AWS Secrets Manager |

## Rulesets

| Ruleset | Language | Strictness |
|---------|----------|------------|
| `typescript-production` | TypeScript | Strict |
| `typescript-internal` | TypeScript | Medium |
| `typescript-prototype` | TypeScript | Relaxed |
| `python-production` | Python | Strict |
| `python-internal` | Python | Medium |
| `python-prototype` | Python | Relaxed |

## Usage

Give an AI assistant the relevant profile from `dist/profiles/`:

```
dist/profiles/typescript-backend-api.md
dist/profiles/llm-service.md
dist/profiles/python-data-pipeline.md
dist/profiles/nextjs-frontend.md
```

The profile contains everything the AI needs to write compliant code.
