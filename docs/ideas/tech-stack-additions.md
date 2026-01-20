# Tech Stack Guidelines - Proposed Additions

**Version 1.2 Draft | January 2026**

This document outlines additional specifications and new sections to be added to the Tech Stack Guidelines based on identified gaps.

---

## Table of Contents - New Sections

1. [Language & Runtime Specifications](#1-language--runtime-specifications)
2. [TypeScript Standards](#2-typescript-standards)
3. [Python Standards](#3-python-standards)
4. [SQL Standards](#4-sql-standards)
5. [ORM Strategy](#5-orm-strategy)
6. [Monorepo Tooling](#6-monorepo-tooling)
7. [Data Engineering & Event Registry](#7-data-engineering--event-registry)
8. [Vector Database & Large Context Management](#8-vector-database--large-context-management)
9. [GPU Compute & Serverless ML](#9-gpu-compute--serverless-ml)
10. [Additional Linting & Quality Tools](#10-additional-linting--quality-tools)

---

## 1. Language & Runtime Specifications

### 1.1 Node.js

| Specification | Value | Notes |
|---------------|-------|-------|
| Version | 22 LTS | Use `.nvmrc` file in all projects |
| Package Manager | **pnpm** | Faster, disk-efficient, strict by default |
| Lock File | `pnpm-lock.yaml` | Committed to git, required for CI |

**Enforcement:**
- `.nvmrc` required in project root
- `engines` field in `package.json`:
```json
{
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.x.x"
}
```

### 1.2 Python

| Specification | Value | Notes |
|---------------|-------|-------|
| Version | 3.12+ | Use `.python-version` file |
| Package Manager | **uv** | Fast, Rust-based pip replacement |
| Virtual Environments | `uv venv` | Project-local `.venv` directory |
| Lock File | `uv.lock` | Committed to git |

---

## 2. TypeScript Standards

### 2.1 TypeScript Configuration

**Version:** TypeScript 5.4+

**Base `tsconfig.json`:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

### 2.2 Testing

| Tool | Use Case | Notes |
|------|----------|-------|
| **bun test** | Primary test runner | Fast, built-in, TypeScript-native |
| **Vitest** | Alternative | When Bun compatibility issues arise |

Both are acceptable. Choose one per project and stick with it.

**Test Configuration (`bunfig.toml`):**
```toml
[test]
coverage = true
coverageThreshold = { line = 70, function = 70, branch = 60 }
```

### 2.3 Execution

| Tool | Use Case |
|------|----------|
| **tsx** | Development (fast TypeScript execution) |
| **tsc** | Type checking only (`tsc --noEmit`) |

### 2.4 Required Tooling

**check-my-toolkit** (npm package) — Must be used for all TypeScript projects.

*[Note: I could not find documentation for this package. Please provide details on what it does so I can document it properly.]*

### 2.5 ESLint Configuration

**Version:** ESLint 9+ (flat config format)

```javascript
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: eslintPluginImport,
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/order': ['error', { 
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc' }
      }],
      'no-console': 'warn',
    },
  }
);
```

**Enforcement:**
- Pre-commit hook via `lint-staged`
- CI pipeline: `eslint . && tsc --noEmit`
- Template includes configuration by default

---

## 3. Python Standards

### 3.1 Tool Stack

| Category | Tool | Notes |
|----------|------|-------|
| Package Management | **uv** | Fast pip replacement |
| Linting & Formatting | **Ruff** | All-in-one, extremely fast |
| Type Checking | **ty** | Faster alternative to mypy |
| Testing | **pytest** | Standard Python testing |

### 3.2 Ruff Configuration

```toml
# pyproject.toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = [
  "E",      # pycodestyle errors
  "W",      # pycodestyle warnings
  "F",      # Pyflakes
  "I",      # isort
  "B",      # flake8-bugbear
  "C4",     # flake8-comprehensions
  "UP",     # pyupgrade
  "ARG",    # flake8-unused-arguments
  "SIM",    # flake8-simplify
  "TCH",    # flake8-type-checking
  "PTH",    # flake8-use-pathlib
  "ERA",    # eradicate (commented-out code)
  "RUF",    # Ruff-specific rules
]
ignore = ["E501"]  # line length handled by formatter

[tool.ruff.lint.isort]
known-first-party = ["palindrom"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

### 3.3 Type Checking with ty

```toml
# pyproject.toml
[tool.ty]
python-version = "3.12"
strict = true
```

**Enforcement:**
- Pre-commit: `ruff check . && ruff format --check . && ty`
- CI pipeline runs all three

---

## 4. SQL Standards

### 4.1 SQLFluff Configuration

```yaml
# .sqlfluff
[sqlfluff]
dialect = postgres
templater = raw
max_line_length = 120

[sqlfluff:rules]
capitalisation_policy = upper
comma_style = trailing

[sqlfluff:indentation]
indent_unit = space
tab_space_size = 4

[sqlfluff:rules:L010]  # Keywords uppercase
capitalisation_policy = upper

[sqlfluff:rules:L014]  # Identifiers lowercase
extended_capitalisation_policy = lower

[sqlfluff:rules:L030]  # Functions uppercase
capitalisation_policy = upper
```

**Enforcement:**
- CI: `sqlfluff lint migrations/`
- Pre-commit hook for `.sql` files

---

## 5. ORM Strategy

### 5.1 Recommendation: **Drizzle ORM**

After evaluating Drizzle and Prisma, we recommend **Drizzle** as the default ORM for new projects.

**Why Drizzle:**

| Factor | Drizzle | Prisma |
|--------|---------|--------|
| Bundle Size | ~7.4kb min+gzip | Heavy (Rust query engine) |
| Cold Start | Excellent (serverless-optimized) | Slower due to engine binary |
| Type Safety | Full inference from schema | Generated types (requires `prisma generate`) |
| SQL Control | SQL-first, transparent queries | Abstracted, less control |
| Learning Curve | Steeper (SQL knowledge required) | Gentler (higher abstraction) |
| Performance | Raw SQL speed | Slight overhead |

**When to Use Prisma Instead:**
- Team unfamiliar with SQL
- Need Prisma Studio for data exploration
- Complex MongoDB requirements
- Existing Prisma codebase

### 5.2 Drizzle Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Schema Example:**
```typescript
// src/db/schema.ts
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: integer('author_id').references(() => users.id),
});
```

**Enforcement:**
- ADR required if choosing Prisma over Drizzle
- Migration files committed to git
- CI validates migrations can apply cleanly

---

## 6. Monorepo Tooling

### 6.1 Tool: **Turborepo**

Turborepo is the standard for managing JavaScript/TypeScript monorepos.

**Why Turborepo:**
- Intelligent caching (never rebuild what hasn't changed)
- Parallel task execution
- Remote caching via Vercel
- Simple configuration (single `turbo.json`)
- Works with pnpm workspaces

### 6.2 Standard Structure

```
monorepo/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Fastify backend
│   └── admin/            # Admin dashboard
├── packages/
│   ├── ui/               # Shared UI components (shadcn/ui)
│   ├── db/               # Drizzle schema & client
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared ESLint, TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 6.3 Configuration

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
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Enforcement:**
- `full-stack` template uses Turborepo by default
- Remote caching enabled for CI (via Vercel)

---

## 7. Data Engineering & Event Registry

### 7.1 Event/Schema Registry: **Apicurio Registry**

For event-driven architectures and data pipelines, we need a central schema registry to manage data contracts.

**What Apicurio Provides:**
- Schema storage and versioning (Avro, JSON Schema, Protobuf)
- API design registry (OpenAPI, AsyncAPI)
- Compatibility rules (backward, forward, full)
- Confluent Schema Registry compatible API
- Integration with Kafka, Debezium, and data pipelines

### 7.2 Data Type Standards

| Data Type | Schema Format | Storage | Processing |
|-----------|---------------|---------|------------|
| **Tabular** | JSON Schema / Avro | PostgreSQL, S3 (Parquet) | Databricks, dbt |
| **Images** | Custom metadata schema | S3 (original + processed) | Modal (GPU) |
| **Video** | Custom metadata schema | S3 (HLS/DASH segments) | Modal (GPU) |
| **Audio** | Custom metadata schema | S3 (original + transcoded) | Modal (GPU) |
| **Free-form Text** | JSON Schema | PostgreSQL (JSONB), S3 | Palindrom-LLM |

### 7.3 Schema Registration Pattern

```typescript
// All data ingestion must register schemas before processing
import { ApicurioRegistryClient } from '@apicurio/registry-client';

const registry = new ApicurioRegistryClient({
  baseUrl: process.env.APICURIO_URL,
});

// Register schema before first use
await registry.createArtifact({
  groupId: 'data-pipelines',
  artifactId: 'patient-records',
  data: patientSchema,
  artifactType: 'JSON',
});
```

### 7.4 Multimodal Data Metadata Schema

All unstructured data must include standard metadata:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "type": { "enum": ["image", "video", "audio", "text", "document"] },
    "source": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "contentHash": { "type": "string" },
    "mimeType": { "type": "string" },
    "sizeBytes": { "type": "integer" },
    "processingStatus": { "enum": ["pending", "processing", "complete", "failed"] },
    "annotations": { "type": "object" },
    "lineage": {
      "type": "object",
      "properties": {
        "parentId": { "type": "string" },
        "transformations": { "type": "array" }
      }
    }
  },
  "required": ["id", "type", "source", "createdAt", "contentHash"]
}
```

---

## 8. Vector Database & Large Context Management

### 8.1 Use Cases

Vector databases enable semantic search and RAG (Retrieval-Augmented Generation) for AI applications:

- **Document Q&A**: Search company documents by meaning, not keywords
- **Knowledge Base**: Power chatbots with relevant context retrieval
- **Semantic Search**: Find similar content across large corpora
- **Recommendation**: Suggest similar items based on embeddings
- **Long Context**: Extend LLM context beyond token limits

### 8.2 Recommendation: **Qdrant**

For our team size and use cases, we recommend **Qdrant** as the default vector database.

**Comparison:**

| Factor | Qdrant | Pinecone | Weaviate | pgvector |
|--------|--------|----------|----------|----------|
| Hosting | Self-hosted or Cloud | Managed only | Self-hosted or Cloud | Extension on RDS |
| Performance | Excellent | Excellent | Good | Good (<50M vectors) |
| Filtering | Advanced | Good | Excellent | Basic |
| Cost | Open source / ~$100/mo cloud | ~$70+/mo | ~$25+/mo | RDS cost only |
| Complexity | Medium | Low | Medium | Low |
| Scale | Billions of vectors | Billions | Hundreds of millions | Tens of millions |

**Why Qdrant:**
- Open source with excellent managed cloud option
- Rust-based, excellent performance
- Rich filtering capabilities
- SOC 2 Type II certified cloud
- 1GB free tier for development
- Straightforward pricing

**When to Use Alternatives:**
- **pgvector**: Small scale (<50M vectors), want single database
- **Pinecone**: Need fully managed, minimal ops, have budget
- **Weaviate**: Need hybrid search with knowledge graphs

### 8.3 Qdrant Integration Pattern

```typescript
// packages/vector-db/src/client.ts
import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Create collection with optimal settings
await qdrant.createCollection('documents', {
  vectors: {
    size: 1536,  // OpenAI embeddings dimension
    distance: 'Cosine',
  },
  optimizers_config: {
    indexing_threshold: 10000,
  },
});

// Search with metadata filtering
const results = await qdrant.search('documents', {
  vector: queryEmbedding,
  limit: 10,
  filter: {
    must: [
      { key: 'project_id', match: { value: projectId } },
      { key: 'type', match: { value: 'policy' } },
    ],
  },
  with_payload: true,
});
```

### 8.4 RAG Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG Pipeline Architecture                 │
├─────────────────────────────────────────────────────────────┤
│  1. Ingestion                                                │
│     Documents → Chunking → Embedding → Qdrant               │
│                                                              │
│  2. Query                                                    │
│     User Query → Embedding → Qdrant Search → Top K Chunks   │
│                                                              │
│  3. Generation                                               │
│     Chunks + Query → Palindrom-LLM → Response               │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. GPU Compute & Serverless ML

### 9.1 Tool: **Modal**

Modal is a serverless platform for running GPU workloads with excellent developer experience.

**What Modal Provides:**
- Serverless GPU compute (scale to zero)
- Python-native SDK (decorators, no YAML)
- Fast cold starts (~1 second)
- Pay-per-second billing
- Access to A100, H100, B200 GPUs
- $30/month free tier

### 9.2 Use Cases for Modal

| Use Case | Why Modal |
|----------|-----------|
| **Image Processing** | GPU-accelerated transformations, CLIP embeddings |
| **Video Processing** | Frame extraction, transcoding, scene detection |
| **Audio Processing** | Whisper transcription, speaker diarization |
| **Model Inference** | Self-hosted LLMs, custom models |
| **Fine-tuning** | LoRA training, embedding model fine-tuning |
| **Batch Processing** | Parallel processing of large datasets |

### 9.3 Modal Integration Pattern

```python
# modal_app.py
import modal

app = modal.App("palindrom-ml")

image = modal.Image.debian_slim().pip_install(
    "torch",
    "transformers",
    "sentence-transformers",
)

@app.function(
    image=image,
    gpu="A10G",
    timeout=600,
    secrets=[modal.Secret.from_name("palindrom-secrets")],
)
def generate_embeddings(texts: list[str]) -> list[list[float]]:
    from sentence_transformers import SentenceTransformer
    
    model = SentenceTransformer("all-MiniLM-L6-v2")
    return model.encode(texts).tolist()

@app.function(image=image, gpu="A100", timeout=3600)
def transcribe_audio(audio_bytes: bytes) -> dict:
    import whisper
    
    model = whisper.load_model("large-v3")
    result = model.transcribe(audio_bytes)
    return {"text": result["text"], "segments": result["segments"]}
```

### 9.4 When to Use Modal vs AWS Lambda

| Workload | Tool | Reason |
|----------|------|--------|
| API endpoints | AWS Lambda (SST) | Integrated with our stack |
| LLM calls | Palindrom-LLM | Observability, caching |
| GPU workloads | Modal | GPU access, scale-to-zero |
| Data pipelines | Databricks | Existing choice for ETL |
| Quick ML experiments | Modal | Fast iteration, no infra |

---

## 10. Additional Linting & Quality Tools

### 10.1 Infrastructure & Config Linting

| File Type | Tool | CI Command |
|-----------|------|------------|
| Dockerfile | **hadolint** | `hadolint Dockerfile` |
| Shell scripts | **shellcheck** | `shellcheck scripts/*.sh` |
| YAML | **yamllint** | `yamllint .` |
| Markdown | **markdownlint** | `markdownlint '**/*.md'` |
| SQL | **SQLFluff** | `sqlfluff lint` |

### 10.2 Security Scanning

| Category | Tool | Notes |
|----------|------|-------|
| Dependency Vulnerabilities | **Dependabot** | GitHub native, auto-PRs |
| Secret Detection | **git-secrets** + **GitHub Secret Scanning** | Pre-commit + server-side |
| SAST | **CodeQL** | GitHub native for TypeScript |
| License Compliance | **license-checker** | `license-checker --summary` |

### 10.3 Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files

  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint

  - repo: https://github.com/shellcheck-py/shellcheck-py
    rev: v0.9.0.6
    hooks:
      - id: shellcheck

  - repo: local
    hooks:
      - id: lint
        name: lint
        entry: pnpm lint
        language: system
        pass_filenames: false
      
      - id: type-check
        name: type-check
        entry: pnpm type-check
        language: system
        pass_filenames: false
```

---

## Summary: New Stack Additions

| Category | Tool | Status |
|----------|------|--------|
| Package Manager | pnpm | **Add to standards** |
| TypeScript Testing | bun test / Vitest | **Add to standards** |
| TypeScript Toolkit | check-my-toolkit | **Add to standards** (need docs) |
| Python Package Manager | uv | **Add to standards** |
| Python Linting | Ruff | **Add to standards** |
| Python Type Checking | ty | **Add to standards** |
| SQL Linting | SQLFluff | **Add to standards** |
| ORM | Drizzle (default), Prisma (exception) | **Add to standards** |
| Monorepo | Turborepo | **Add to standards** |
| Schema Registry | Apicurio Registry | **Add to standards** |
| Vector Database | Qdrant | **Add to standards** |
| GPU Compute | Modal | **Add to standards** |

---

## Open Questions

1. **check-my-toolkit**: What does this package do? I couldn't find documentation for it.

2. **Apicurio Registry Deployment**: Self-hosted on AWS or managed service?

3. **Qdrant Deployment**: Qdrant Cloud or self-hosted on AWS?

4. **Modal Integration with SST**: How should Modal workloads be triggered from SST-deployed services?

5. **Vector Embedding Model**: Standardize on OpenAI embeddings, or self-host (e.g., `all-MiniLM-L6-v2`)?

---

*— End of Proposed Additions —*