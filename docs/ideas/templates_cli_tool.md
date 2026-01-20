# Templates CLI Tool: `@company/create-project`

## Overview

`@company/create-project` is our internal CLI for scaffolding new projects. It generates standardized project structures with all our conventions pre-configured.

## Installation

```bash
# Global install (recommended)
npm install -g @company/create-project

# Or use directly with npx
npx @company/create-project
```

---

## Usage

### Interactive Mode

```bash
npx @company/create-project
```

Prompts for:
1. Project name
2. Template type
3. Optional features

### Direct Mode

```bash
npx @company/create-project my-project --template=fastify-api
```

### Full Options

```bash
npx @company/create-project <project-name> [options]

Arguments:
  project-name              Name of the project (kebab-case)

Options:
  -t, --template <type>     Template to use (see templates below)
  -d, --directory <path>    Directory to create project in (default: ./<project-name>)
  --no-git                  Don't initialize git repository
  --no-install              Don't run npm install
  --package-manager <pm>    Package manager: npm, yarn, pnpm (default: npm)
  --json                    Output result as JSON (for agent usage)
  -h, --help                Show help
  -v, --version             Show version
```

---

## Available Templates

### `fastify-api`

Standard API backend project.

```bash
npx @company/create-project my-api --template=fastify-api
```

**Generated structure:**
```
my-api/
├── .devcontainer/
│   └── devcontainer.json       # GitHub Codespaces config
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Lint, test, build
│   │   └── deploy.yml          # SST deployment
│   └── CODEOWNERS
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   └── runbooks/
├── src/
│   ├── routes/
│   │   ├── health.ts           # Health check endpoint
│   │   └── index.ts            # Route registration
│   ├── services/
│   │   └── example.service.ts
│   ├── repositories/
│   │   └── example.repository.ts
│   ├── lib/
│   │   ├── ai.ts               # @company/ai configuration
│   │   └── monitoring.ts       # Better Stack error tracking + logging
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── app.ts                  # Fastify app setup
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── prompts/                    # Local prompt development
│   └── .gitkeep
├── .env.template               # Environment variable template
├── biome.json                  # Extends @company/config
├── openapi.yaml                # API specification
├── package.json
├── sst.config.ts               # Infrastructure
├── tsconfig.json               # Extends @company/config
└── README.md
```

**Includes:**
- Fastify with TypeScript
- SST v3 deployment configuration
- `@company/ai` pre-configured
- Better Stack error tracking + structured logging
- OpenAPI documentation setup
- Biome linting/formatting
- Vitest for testing
- GitHub Actions CI/CD
- Devcontainer for Codespaces

---

### `nextjs-frontend`

Standard frontend project.

```bash
npx @company/create-project my-app --template=nextjs-frontend
```

**Generated structure:**
```
my-app/
├── .devcontainer/
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # Streaming AI endpoint
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── chat/               # Chat interface components
│   ├── lib/
│   │   ├── ai.ts               # AI client config
│   │   ├── monitoring.ts       # Better Stack error tracking
│   │   └── utils.ts
│   └── styles/
│       └── globals.css         # Tailwind + company theme
├── public/
├── .env.template
├── biome.json
├── components.json             # shadcn/ui config
├── next.config.js
├── package.json
├── tailwind.config.js          # Company theme
├── tsconfig.json
└── README.md
```

**Includes:**
- Next.js 14+ with App Router
- shadcn/ui with company theme pre-configured
- Tailwind CSS
- AI streaming endpoint example
- Better Stack error tracking (browser + server)
- Biome linting/formatting
- Vercel deployment ready

---

### `data-pipeline`

Data engineering project for Databricks.

```bash
npx @company/create-project my-pipeline --template=data-pipeline
```

**Generated structure:**
```
my-pipeline/
├── .github/
│   └── workflows/
│       └── ci.yml
├── notebooks/
│   ├── 01_ingest/
│   ├── 02_transform/
│   └── 03_output/
├── src/
│   ├── transformations/
│   └── utils/
├── dbt/
│   ├── models/
│   ├── macros/
│   └── dbt_project.yml
├── tests/
│   ├── data_quality/
│   └── unit/
├── great_expectations/
│   └── expectations/
├── config/
│   ├── development.yaml
│   ├── staging.yaml
│   └── production.yaml
├── .env.template
├── pyproject.toml
├── README.md
└── Makefile
```

**Includes:**
- Databricks notebook structure
- dbt models setup
- Great Expectations validation
- Python project configuration
- Environment configs

---

### `full-stack`

Monorepo with API and frontend.

```bash
npx @company/create-project my-product --template=full-stack
```

**Generated structure:**
```
my-product/
├── .devcontainer/
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── packages/
│   ├── api/                    # fastify-api template
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   ├── web/                    # nextjs-frontend template
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── shared/                 # Shared types/utilities
│       ├── src/
│       │   └── types/
│       └── package.json
├── prompts/                    # Shared prompts
├── turbo.json                  # Turborepo config
├── package.json                # Workspace root
├── sst.config.ts               # Unified infrastructure
└── README.md
```

**Includes:**
- Turborepo for monorepo management
- Shared TypeScript types
- Unified SST deployment
- Shared prompts directory

---

### `llm-agent`

Agent-focused project with evaluation harness.

```bash
npx @company/create-project my-agent --template=llm-agent
```

**Generated structure:**
```
my-agent/
├── .devcontainer/
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── eval.yml            # Scheduled evaluations
├── src/
│   ├── agents/
│   │   ├── index.ts
│   │   └── main-agent.ts
│   ├── tools/
│   │   ├── index.ts
│   │   └── example.tool.ts
│   ├── lib/
│   │   ├── ai.ts
│   │   └── monitoring.ts       # Better Stack error tracking
│   └── types/
├── prompts/
│   └── agent/
│       ├── system/
│       │   └── prompt.yaml
│       └── tools/
├── evals/
│   ├── datasets/
│   │   └── golden.yaml
│   ├── judges/
│   │   └── quality.yaml
│   └── run-evals.ts
├── tests/
├── .env.template
├── biome.json
├── package.json
├── sst.config.ts
├── tsconfig.json
└── README.md
```

**Includes:**
- Agent structure with tools
- Evaluation harness
- Golden dataset setup
- LLM-as-judge configurations
- Scheduled evaluation workflow
- Better Stack error tracking + logging

---

## Post-Scaffold Actions

After scaffolding, the CLI:

1. **Initializes git** (unless `--no-git`)
2. **Installs dependencies** (unless `--no-install`)
3. **Prints next steps**

```
✅ Project created successfully!

Next steps:
  cd my-api
  cp .env.template .env
  # Edit .env with your configuration
  npm run dev

Useful commands:
  npm run dev          Start development server
  npm run test         Run tests
  npm run lint         Lint and format code
  npm run build        Build for production
  npx sst deploy       Deploy to AWS
```

---

## Agent-Friendly Output

When called with `--json`, outputs structured data:

```bash
npx @company/create-project my-api --template=fastify-api --json
```

```json
{
  "success": true,
  "project": {
    "name": "my-api",
    "path": "/Users/dev/projects/my-api",
    "template": "fastify-api"
  },
  "actions": {
    "git_initialized": true,
    "dependencies_installed": true
  },
  "next_steps": [
    "cd my-api",
    "cp .env.template .env",
    "npm run dev"
  ]
}
```

---

## Template Configuration

Each template is defined by a configuration file:

```typescript
// templates/fastify-api/template.config.ts
import { defineTemplate } from '@company/create-project';

export default defineTemplate({
  name: 'fastify-api',
  description: 'Standard Fastify API backend',
  
  prompts: [
    {
      name: 'includeAuth',
      type: 'confirm',
      message: 'Include authentication boilerplate?',
      default: false,
    },
    {
      name: 'database',
      type: 'select',
      message: 'Database type:',
      choices: ['postgres', 'dynamodb', 'none'],
      default: 'postgres',
    },
  ],
  
  files: './files',  // Directory containing template files
  
  // Dynamic file inclusion based on prompts
  conditionalFiles: {
    'src/auth/': (answers) => answers.includeAuth,
    'src/db/postgres.ts': (answers) => answers.database === 'postgres',
    'src/db/dynamodb.ts': (answers) => answers.database === 'dynamodb',
  },
  
  // Post-scaffold hooks
  afterScaffold: async ({ projectPath, answers }) => {
    // Any custom setup logic
  },
});
```

---

## Creating New Templates

### 1. Create Template Directory

```bash
mkdir templates/my-new-template
```

### 2. Add Template Files

```
templates/my-new-template/
├── files/                      # Template files (copied to project)
│   ├── src/
│   ├── package.json.hbs        # .hbs files are processed with Handlebars
│   └── README.md.hbs
└── template.config.ts          # Template configuration
```

### 3. Use Handlebars for Dynamic Content

```handlebars
// files/package.json.hbs
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "scripts": {
    "dev": "{{#if usesTsx}}tsx watch{{else}}ts-node-dev{{/if}} src/index.ts"
  },
  "dependencies": {
    "@company/ai": "^1.0.0"
    {{#if includeAuth}}
    ,"@company/auth": "^1.0.0"
    {{/if}}
  }
}
```

### 4. Register Template

```typescript
// src/templates/index.ts
export { default as fastifyApi } from '../../templates/fastify-api/template.config';
export { default as nextjsFrontend } from '../../templates/nextjs-frontend/template.config';
export { default as myNewTemplate } from '../../templates/my-new-template/template.config';
```

---

## Template Variables

Available in all `.hbs` template files:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{projectName}}` | Project name (kebab-case) | `my-api` |
| `{{projectNamePascal}}` | PascalCase name | `MyApi` |
| `{{projectNameCamel}}` | camelCase name | `myApi` |
| `{{year}}` | Current year | `2026` |
| `{{date}}` | Current date | `2026-01-20` |
| `{{author}}` | Git user name | `Alice Smith` |
| `{{email}}` | Git user email | `alice@company.com` |

Plus any custom variables from template prompts.

---

## Updating Templates

When templates are updated in the CLI package:

1. **New projects** get the latest version automatically
2. **Existing projects** are not affected (they own their code)
3. **Migration guides** are provided in release notes for significant changes

---

## Integration with Other Tools

### With Better Stack

All templates come with Better Stack pre-configured for error tracking and logging:

```typescript
// Generated in src/lib/monitoring.ts
import * as Logtail from '@logtail/node';
import * as BetterStack from '@betterstack/errors';

// Error tracking (Sentry-compatible API)
BetterStack.init({
  dsn: process.env.BETTERSTACK_DSN,
  environment: process.env.STAGE || 'development',
});

// Structured logging
export const logger = new Logtail.Logtail(process.env.BETTERSTACK_SOURCE_TOKEN);

// Helper for capturing errors with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  BetterStack.captureException(error, { extra: context });
  logger.error(error.message, { error, ...context });
}

// Fastify plugin for automatic error tracking
export const monitoringPlugin = fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    BetterStack.captureException(error, {
      tags: { route: request.url, method: request.method },
      user: { id: request.user?.id },
    });
    reply.status(500).send({ error: 'Internal Server Error' });
  });
});
```

For Next.js projects, client-side error tracking is also configured:

```typescript
// Generated in src/lib/monitoring.ts (Next.js)
import * as BetterStack from '@betterstack/errors';

BetterStack.init({
  dsn: process.env.NEXT_PUBLIC_BETTERSTACK_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
});

// Use in error boundaries or catch blocks
export function captureError(error: Error) {
  BetterStack.captureException(error);
}
```

### With `@company/ai`

All templates come with `@company/ai` pre-configured:

```typescript
// Generated in src/lib/ai.ts
import { createAI } from '@company/ai';

export const ai = createAI({
  prompts: {
    source: process.env.NODE_ENV === 'development' ? 'local' : 'langfuse',
    localPath: './prompts',
  },
  llm: {
    baseURL: process.env.LITELLM_URL,
    apiKey: process.env.LITELLM_KEY,
  },
  observability: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_URL,
  },
});
```

### With `prompt` CLI

Templates include a `prompts/` directory for local prompt development:

```bash
# After scaffolding
cd my-api
prompt create my-api/my-feature
# Creates ./prompts/my-api/my-feature/prompt.yaml
```

### With SST

Templates include SST configuration:

```typescript
// Generated in sst.config.ts
export default {
  config() {
    return {
      name: "my-api",
      region: "us-east-1",
    };
  },
  stacks(app) {
    // Template-specific infrastructure
  },
};
```

---

## CLI Development

### Running Locally

```bash
# Clone the CLI repo
git clone git@github.com:company/create-project.git
cd create-project

# Install dependencies
npm install

# Link for local development
npm link

# Test scaffolding
npx @company/create-project test-project --template=fastify-api
```

### Testing

```bash
# Run all tests
npm test

# Test specific template
npm test -- --grep="fastify-api"
```

### Publishing

```bash
# Bump version
npm version patch|minor|major

# Publish
npm publish
```
