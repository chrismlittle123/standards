# Tech Stack Guidelines & Engineering Standards

**Version 1.1 | January 2026**

12-Month Aspirational Roadmap

Prepared for: AI Engineering Team (6 Engineers)

*AI Consultancy & Product Studio*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Technology Stack](#2-core-technology-stack)
3. [Project Structure & Templates](#3-project-structure--templates)
4. [Code Quality Standards](#4-code-quality-standards)
5. [Security & Secrets Management](#5-security--secrets-management)
6. [Documentation Standards](#6-documentation-standards)
7. [CI/CD & Deployment](#7-cicd--deployment)
8. [LLMOps & AI Application Standards](#8-llmops--ai-application-standards)
9. [Adoption Roadmap](#9-adoption-roadmap)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

### 1.1 Purpose

This document establishes technology standards and engineering practices for our AI consultancy. It addresses the core problem: every engineer builds in their own way, resulting in 15+ tools across projects, constant reinvention of solved problems, and a 2-month onboarding process for new team members.

### 1.2 Guiding Principles

- **Every standard has corresponding enforcement tooling** — rules without automation are suggestions
- **Consistency over perfection** — a good standard followed everywhere beats a perfect standard followed sometimes
- **AWS power with modern DX** — leverage AWS infrastructure while abstracting away painful UIs
- **New projects only (initially)** — existing projects migrate opportunistically

### 1.3 Success Metrics (12-Month Targets)

| Metric | Current | Target |
|--------|---------|--------|
| New engineer onboarding time | 2 months | < 1 week |
| Tools/frameworks in active use | 15+ | < 10 core |
| Test coverage (backend) | 0% | > 70% |
| API documentation coverage | Ad-hoc | 100% OpenAPI |
| LLM observability coverage | 0% | 100% |
| Secrets in .env files | 100% | 0% |

---

## 2. Core Technology Stack

This section defines the 'blessed' tools for each category. Deviation requires an ADR (Architecture Decision Record).

### 2.1 Stack Overview

| Category | Tool | Why |
|----------|------|-----|
| Deployment/IaC | SST v3 | AWS power + Railway-like DX, TypeScript config, one-command deploys |
| API Framework | Fastify | Already adopted, fast, TypeScript-first, excellent plugin ecosystem |
| LLM Gateway | Palindrom-LLM (custom) | Unified API for OpenAI/Anthropic/Google, cost tracking, fallbacks, rate limiting |
| LLM Observability | Palindrom-LLM (custom) | Tracing, evals, prompt versioning — integrated into single framework |
| LLM Performance | Palindrom-LLM (custom) | Benchmarking, latency tracking, quality metrics |
| Prompt Management | Palindrom-LLM (custom) | Version control, A/B testing, deployment workflows |
| Observability | Better Stack | Error tracking, logs, uptime monitoring, incident management — all-in-one |
| Secrets (Human Auth) | 1Password | Logins, passwords, passkeys for SaaS tools and dashboards |
| Secrets (Machine) | AWS Secrets Manager | All API keys, database credentials, service tokens — single source of truth |
| Data Pipelines | Databricks | Scales from simple ETL to 100+ pipelines, excellent UX, batch processing |
| Frontend | Next.js + shadcn/ui | React ecosystem, customizable component library, Tailwind-based |
| Database | PostgreSQL (RDS) | Default choice; DynamoDB for specific high-scale use cases |
| Linting/Formatting | ESLint + Prettier | Already integrated, mature ecosystem, extensive plugin support |
| Project Management | Linear | Already adopted, fast, keyboard-driven |

### 2.2 SST v3 (Deployment & Infrastructure)

#### Why SST over raw CDK

SST provides the AWS CDK's power with dramatically better developer experience. Key benefits:

- Single TypeScript config file (`sst.config.ts`) — no YAML, no CloudFormation templates
- One-command deploys: `npx sst deploy` handles everything
- Live Lambda development with hot reloading (milliseconds, not minutes)
- Resource linking — automatically wires IAM policies and environment variables
- Built on Pulumi+Terraform (v3), avoiding CloudFormation's limitations

#### Enforcement

- CLI template generates SST config by default
- CI pipeline validates `sst.config.ts` exists
- Manual AWS Console changes blocked in production accounts

### 2.3 Palindrom-LLM (Custom LLM Framework)

#### Why Build Custom

No single tool on the market covers everything we need: gateway routing, observability, performance benchmarking, and prompt management. Existing solutions (LiteLLM, Langfuse, PromptLayer, etc.) each solve part of the problem, but using them together creates integration overhead, multiple dashboards, and fragmented workflows. Palindrom-LLM wraps the best ideas from these tools into a single, simplified framework purpose-built for our team.

#### What Palindrom-LLM Provides

**LLM Gateway**
- Single endpoint for all LLM providers (OpenAI, Anthropic, Google)
- OpenAI-compatible API for easy adoption
- Virtual keys per project with budget limits
- Automatic fallback: if Claude is down, route to GPT-4
- Rate limiting and cost tracking with spend alerts

**LLM Observability**
- Every LLM call logged: prompt, response, latency, tokens, cost
- Traces for multi-step agent workflows and RAG pipelines
- Session grouping by user conversation
- Dashboard with real-time metrics

**LLM Performance**
- Benchmarking across providers and models
- Latency tracking (p50, p95, p99)
- Quality metrics and regression detection
- A/B comparison between model versions

**Prompt Management**
- Prompts versioned with semantic versioning
- A/B testing via prompt variants
- Prompt changes without code deployment
- Approval workflow for production prompts

#### Ownership

Palindrom-LLM is shared ownership across all 6 engineers. Development is collaborative, with contributions expected from the entire team.

#### Enforcement

- Direct provider API keys not available to individual projects
- All LLM calls must go through Palindrom-LLM
- CI checks for hardcoded API keys in codebase
- Dashboard alerts if a project has zero traces for 24 hours
- Weekly cost/quality review meetings use Palindrom-LLM data

### 2.4 shadcn/ui (Frontend Component Library)

#### Why Not Build Our Own

Our UIs are currently inconsistent and low quality. shadcn/ui provides beautifully designed, accessible components that we own and can customize. It's copy-paste code, not a dependency, so we maintain full control.

#### Our Branded Theme

We will create a custom shadcn/ui theme (colors, typography, spacing) that defines our visual brand. All projects use this theme as a starting point.

#### Enforcement

- Frontend template includes pre-configured shadcn/ui with our theme
- Design review checklist verifies shadcn/ui usage
- Storybook documents all components with our customizations

### 2.5 Better Stack (Observability Platform)

#### Why Better Stack over Sentry + Datadog

We evaluated multiple observability tools and concluded that Better Stack provides the best value for our team size and use case. It replaces the need for both Sentry (error tracking) and Datadog (logs/monitoring) with a single, unified platform.

**Why not Sentry?**
- Sentry is excellent for error tracking but doesn't include logs or uptime monitoring
- Event-based pricing creates budget uncertainty at scale
- We'd still need a separate tool for logs and infrastructure monitoring

**Why not Datadog?**
- Datadog's strength is deep APM for complex microservice architectures — overkill for a 6-person team
- Pricing is complex and scales unpredictably (per-host, per-GB, per-feature)
- We already have LLM tracing via Palindrom-LLM, which is the majority of our "distributed tracing" needs

**Why Better Stack?**
- All-in-one: error tracking, logs, uptime monitoring, incident management
- Sentry-compatible SDKs — 5-minute migration using existing code
- 83% cheaper than Sentry/Datadog at scale ($5k vs $30k for 100M events)
- AI-powered error summaries designed for coding assistants (Claude Code, Cursor)
- SQL-compatible log queries
- Clean, modern UI that developers actually enjoy using

#### What Better Stack Provides

**Error Tracking**
- Automatic error grouping by stack trace (customizable)
- Sentry-compatible SDKs for all our languages (TypeScript, Python)
- Browser context, environment variables, and full stack traces
- Snooze non-critical errors, get notified if they become severe
- AI summaries you can copy directly into Claude Code

**Log Management**
- Structured JSON logs with sub-second search across billions of lines
- SQL queries for custom reports and dashboards
- Correlate errors with logs in a single view
- Retention policies to manage costs

**Uptime Monitoring**
- 30-second checks for APIs, websites, DNS, SSL
- Screenshots on failure for visual context
- Multi-region checks to detect regional outages

**Incident Management**
- On-call schedules with escalation policies
- Alerts via Slack, SMS, phone call, email
- Status pages for client communication
- Integrates with Linear for ticket creation

#### Our Observability Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Palindrom Observability Stack               │
├─────────────────────────────────────────────────────────────┤
│  LLM Calls      →  Palindrom-LLM (traces, evals, cost)      │
│  App Errors     →  Better Stack (grouping, context, AI)     │
│  Logs           →  Better Stack (SQL queries, dashboards)   │
│  Uptime         →  Better Stack (30-sec checks, alerts)     │
│  Incidents      →  Better Stack (on-call, status pages)     │
│  AWS Infra      →  CloudWatch (metrics, alarms via SST)     │
└─────────────────────────────────────────────────────────────┘
```

#### Integration

All project templates include Better Stack SDK pre-configured:

```typescript
// src/lib/monitoring.ts
import * as Logtail from '@logtail/node';
import * as BetterStack from '@betterstack/errors';

// Error tracking (Sentry-compatible API)
BetterStack.init({
  dsn: process.env.BETTERSTACK_DSN,
  environment: process.env.STAGE,
});

// Structured logging
export const logger = new Logtail.Logtail(process.env.BETTERSTACK_SOURCE_TOKEN);

// Usage in application code
try {
  await riskyOperation();
} catch (error) {
  BetterStack.captureException(error, {
    tags: { feature: 'diagnosis', patientId },
  });
  throw error;
}
```

#### Enforcement

- CLI template includes Better Stack SDK configuration
- CI check: Better Stack DSN must be configured for staging/production
- Dashboard alerts if a project has zero error events for 7 days
- Uptime monitors required for all production APIs

---

## 3. Project Structure & Templates

### 3.1 Project Scaffolding CLI

Instead of starting from scratch, engineers use our internal CLI to scaffold new projects:

```bash
npx @company/create-project
```

The CLI prompts for project type and generates the appropriate template with all standards pre-configured.

#### Available Templates

| Template | What It Includes |
|----------|------------------|
| fastify-api | Fastify + TypeScript + SST + ESLint/Prettier + OpenAPI + Palindrom-LLM integration |
| data-pipeline | Databricks notebooks + dbt + Great Expectations + S3 integration |
| nextjs-frontend | Next.js + shadcn/ui (themed) + Tailwind + ESLint/Prettier + Vercel config |
| llm-agent | LangChain + Palindrom-LLM client + tracing + evaluation harness |
| full-stack | Monorepo with fastify-api + nextjs-frontend + shared types |

### 3.2 Standard Folder Structure (API Projects)

```
project-name/
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   └── CODEOWNERS
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── runbooks/               # Operational runbooks
│   └── architecture.md         # System architecture diagram
├── src/
│   ├── routes/                 # API route handlers
│   ├── services/               # Business logic
│   ├── repositories/           # Data access layer
│   ├── types/                  # TypeScript types
│   └── utils/                  # Shared utilities
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── openapi.yaml                # API specification
├── sst.config.ts               # Infrastructure
├── .eslintrc.json              # Linting config
├── .prettierrc                 # Formatting config
└── README.md
```

## 4. Code Quality Standards

### 4.1 Linting & Formatting with ESLint + Prettier

We use ESLint for linting and Prettier for formatting. All projects use a shared configuration for consistency.

#### Standard ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn"
  }
}
```

#### Standard Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

#### Enforcement

- Pre-commit hook: `lint-staged` runs ESLint + Prettier on staged files
- CI pipeline: `eslint . && prettier --check .` (fails on any violation)
- VS Code extensions: ESLint + Prettier with format on save
- GitHub Action comment on PRs with violations

### 4.2 Testing Strategy

Target: 70%+ test coverage for backend code within 12 months. We use a layered testing approach:

#### Testing Pyramid

| Layer | Tools | What We Test |
|-------|-------|--------------|
| Unit Tests | Vitest | Business logic, utilities, pure functions |
| Integration Tests | Vitest + Testcontainers | API endpoints, database queries, external services |
| E2E Tests | Playwright | Critical user journeys (login, core workflows) |
| Contract Tests | Spectral + Prism | API responses match OpenAPI spec |
| LLM Evals | Palindrom-LLM Evals | LLM output quality, regression detection |

#### Enforcement

- CI blocks merge if coverage drops below threshold
- PR template requires test plan for new features
- Coverage reports posted as PR comments

### 4.3 Git Workflow

#### Branch Strategy

- **main:** Production-ready code, protected branch
- **develop:** Integration branch for staging
- **feature/*:** Feature branches, short-lived (< 1 week)

#### PR Requirements

- At least 1 approval required
- All CI checks must pass
- Linked Linear ticket
- Squash merge with conventional commit message

#### Conventional Commits

```
feat: add user authentication
fix: resolve database connection timeout
docs: update API documentation
chore: upgrade dependencies
refactor: simplify prompt engineering logic
```

#### Enforcement

- Branch protection rules on GitHub
- Commit message linting via commitlint
- CODEOWNERS file for automatic reviewer assignment

---

## 5. Security & Secrets Management

### 5.1 Secrets Architecture

No more secrets in .env files. No more copying API keys into GitHub Actions. We use a clean separation:

| Secret Type | Where It Lives | Examples |
|-------------|----------------|----------|
| Human authentication | 1Password | SaaS logins, dashboard passwords, passkeys |
| Machine secrets | AWS Secrets Manager | API keys, database credentials, service tokens |

**The Rule:** If code needs it, it's in AWS Secrets Manager. If a human types it into a browser, it's in 1Password.

### 5.2 AWS Secrets Manager (Machine Secrets)

All machine secrets live in AWS Secrets Manager — the single source of truth.

#### What Goes Here

- LLM provider API keys (OpenAI, Anthropic, Google)
- Database connection strings
- Third-party service tokens (Stripe, SendGrid, etc.)
- Internal service credentials

#### How It's Accessed

- **SST:** Automatically wires secrets to Lambda functions via resource linking
- **Local dev:** AWS SSO login → SST/scripts pull secrets at runtime
- **CI/CD:** GitHub Actions OIDC (see below)

#### Benefits

- Automatic rotation for supported services
- Audit logging via CloudTrail for all secret access
- No secrets stored on developer laptops
- Single place to manage, rotate, and audit

### 5.3 GitHub Actions OIDC (CI/CD Secrets)

GitHub Actions authenticates to AWS via OIDC federation — no stored credentials.

#### How It Works

1. GitHub Actions requests an OIDC token from GitHub
2. Token is exchanged for temporary AWS credentials via `AssumeRoleWithWebIdentity`
3. CI job pulls secrets from AWS Secrets Manager at runtime
4. Credentials expire after the job completes

#### Why This Matters

- **No GitHub secrets to manage.** Nothing to copy/paste, nothing to rotate in GitHub's UI.
- **No environment variables to configure.** Secrets are pulled dynamically.
- **Unified audit trail.** All access logged in AWS CloudTrail.
- **Least privilege.** Each repo/branch can have scoped IAM roles.

#### Setup

```yaml
# .github/workflows/deploy.yml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions-deploy
          aws-region: us-east-1
      
      # Now all AWS SDK calls (including Secrets Manager) just work
      - run: npx sst deploy --stage production
```

### 5.4 Local Development

Engineers authenticate via AWS SSO (Identity Center) for local development:

```bash
# One-time login (opens browser)
aws sso login --profile dev

# SST pulls secrets automatically
npx sst dev
```

No `.env` files. No 1Password CLI for API keys. Just SSO login and go.

### 5.5 1Password (Human Auth Only)

1Password is strictly for human authentication:

- SaaS tool logins (Linear, Figma, Slack admin, etc.)
- Dashboard passwords (AWS Console, Vercel, etc.)
- Passkeys and 2FA recovery codes
- Shared credentials for services without SSO

**1Password is NOT for:**
- API keys
- Database credentials
- Service tokens
- Anything that code or CI needs

### 5.6 Enforcement

- CI check: `.env` files must not exist (fail if found)
- CI check: No hardcoded secrets in codebase (git-secrets + GitHub scanning)
- GitHub Actions: Only OIDC authentication allowed, no repository secrets for AWS
- IAM policies: Secrets Manager access scoped by project/environment
- Quarterly audit: Review CloudTrail logs for secret access patterns

---

## 6. Documentation Standards

### 6.1 Required Documentation

Every project must have the following documentation:

| Document | Contents | Enforcement |
|----------|----------|-------------|
| README.md | Project overview, quick start, architecture summary | CI check: file exists |
| openapi.yaml | Complete API specification with examples | Spectral linting in CI |
| architecture.md | System diagram (Mermaid), component descriptions | PR template reminder |
| docs/adr/ | Architecture Decision Records for major choices | Required for non-standard tools |
| docs/runbooks/ | Operational procedures, incident response | Required before production |

### 6.2 API Documentation (OpenAPI)

All APIs are documented using OpenAPI 3.1 specification. The spec is the source of truth.

#### Spectral Linting

We use Stoplight Spectral to lint OpenAPI specs in CI. Our custom ruleset enforces:

- All endpoints have descriptions and examples
- Response schemas defined for all status codes
- Security schemes applied to all endpoints
- Consistent naming conventions (kebab-case paths, camelCase properties)

#### Generated Documentation

OpenAPI specs automatically generate interactive documentation using Stoplight Elements or Redoc, deployed alongside each API.

### 6.3 Architecture Decision Records (ADRs)

When deviating from standards or making significant architectural choices, document the decision:

#### ADR Template

```markdown
# ADR-001: Use Redis for Session Storage

## Status
Accepted

## Context
What is the issue we're addressing?

## Decision
What is the change we're proposing?

## Consequences
What are the tradeoffs?
```

#### When ADRs Are Required

- Using a tool not in the blessed stack
- Significant deviation from project template structure
- Adding a new external dependency or service
- Choosing between multiple valid approaches

---

## 7. CI/CD & Deployment

### 7.1 Pipeline Architecture

All projects use GitHub Actions with a standardized pipeline:

#### Standard Pipeline Stages

1. **Lint:** Biome check (formatting, linting, imports)
2. **Type Check:** TypeScript compilation
3. **Test:** Unit + Integration tests (parallel)
4. **Security:** Secret scanning, dependency audit
5. **API Contract:** Spectral lint + Prism validation
6. **Build:** SST build
7. **Deploy:** SST deploy (staging on PR, production on main)

### 7.2 Environment Strategy

| Environment | Trigger | Purpose |
|-------------|---------|---------|
| Development | Local / Codespaces | Individual development |
| Preview | Pull Request opened | Isolated testing per PR |
| Staging | Merge to develop | Integration testing, client demos |
| Production | Merge to main | Live client environment |

### 7.3 Deployment with SST

SST manages deployments to all environments:

```bash
# Preview environment (auto-created per PR)
npx sst deploy --stage pr-123

# Staging
npx sst deploy --stage staging

# Production
npx sst deploy --stage production
```

#### Enforcement

- Manual deployments to production are blocked
- All deployments go through CI/CD pipeline
- Deployment requires all checks passing

---

## 8. LLMOps & AI Application Standards

### 8.1 LLM Integration Pattern

All LLM calls follow a standardized pattern using Palindrom-LLM:

```typescript
// Standard LLM call pattern
import { palindrom } from '@company/palindrom-llm';

const response = await palindrom.complete({
  model: 'gpt-4o', // Palindrom-LLM routes to configured provider
  messages: [{ role: 'user', content: prompt }],
  metadata: {
    project: 'hospital-interpreter',
    feature: 'diagnosis-summary',
    userId: user.id,
  }
});

// Automatically traced in Palindrom-LLM with metadata
```

### 8.2 Prompt Management

Prompts are managed in Palindrom-LLM, not hardcoded in application code:

- Prompts versioned with semantic versioning
- A/B testing via Palindrom-LLM's prompt variants
- Prompt changes don't require code deployment
- Production prompts require approval before activation

### 8.3 Evaluation Framework

All AI features must have defined evaluation criteria:

#### Evaluation Types

| Type | Description | When Used |
|------|-------------|-----------|
| LLM-as-Judge | Claude/GPT evaluates output quality against criteria | Every prompt change |
| Human Annotation | Team members label sample outputs | Weekly sampling |
| User Feedback | Thumbs up/down, explicit ratings | Production (optional) |
| Regression Tests | Golden dataset with expected outputs | CI on prompt changes |

### 8.4 Cost Management

LLM costs are tracked and controlled via Palindrom-LLM at multiple levels:

- **Project-level budgets:** Each project has a monthly LLM budget
- **Model selection:** Use smaller models for simpler tasks
- **Caching:** Palindrom-LLM caches identical requests
- **Alerts:** Slack notification at 80% budget, hard cutoff at 100%

---

## 9. Adoption Roadmap

### 9.1 Phased Rollout

#### Phase 1: Foundation (Months 1-3)

- Begin development of Palindrom-LLM framework
- Set up 1Password team account and vaults
- Create project templates and scaffolding CLI
- Migrate 1 pilot project to new standards

#### Phase 2: New Projects (Months 4-6)

- All new projects must use templates
- Palindrom-LLM v1.0 deployed; all LLM calls routed through it
- CI/CD pipeline template deployed
- Testing requirements enforced for new code
- shadcn/ui theme finalized

#### Phase 3: Migration (Months 7-9)

- Existing projects migrate to Palindrom-LLM
- Legacy .env files eliminated
- Test coverage added to critical paths
- OpenAPI specs created for all APIs

#### Phase 4: Optimization (Months 10-12)

- All targets met (see Section 1.3)
- Advanced LLMOps: prompt optimization, fine-tuning pipeline
- Internal training and documentation complete
- Continuous improvement process established

### 9.2 Exception Process

Sometimes standards don't fit. Here's how to deviate:

1. Write an ADR explaining the context and decision
2. Get approval from at least one other engineer
3. Document the deviation in the project README
4. Review after 3 months: adopt broadly or revert?

---

## 10. Appendix

### 10.1 Tool Links

- **Palindrom-LLM:** Internal framework (see Section 2.3)
- **Better Stack:** https://betterstack.com
- **SST:** https://sst.dev
- **ESLint:** https://eslint.org
- **Prettier:** https://prettier.io
- **shadcn/ui:** https://ui.shadcn.com
- **Spectral:** https://stoplight.io/open-source/spectral
- **1Password Developer:** https://developer.1password.com

### 10.2 Enforcement Checklist

Quick reference for CI/CD enforcement:

| Check | Implementation |
|-------|----------------|
| ESLint passes | `eslint .` in CI |
| Prettier formatting | `prettier --check .` in CI |
| TypeScript compiles | `tsc --noEmit` in CI |
| Tests pass with coverage | `vitest --coverage` in CI |
| No secrets in code | git-secrets + GitHub scanning |
| No .env files | CI fails if `.env` files exist |
| AWS auth via OIDC only | No repository secrets for AWS credentials |
| OpenAPI spec valid | `spectral lint openapi.yaml` |
| Conventional commits | commitlint in PR check |
| README exists | file-exists check in CI |
| Better Stack configured | `BETTERSTACK_DSN` required for staging/prod |
| Uptime monitors exist | Better Stack API check for production endpoints |

### 10.3 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | January 2026 | Added Better Stack as unified observability platform (replaces Sentry + Datadog) |
| 1.0 | January 2026 | Initial release |

---

*— End of Document —*
