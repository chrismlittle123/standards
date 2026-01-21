---
id: python
title: Python
category: architecture
priority: 2
tags: [python, llm, databricks, livekit-agents]
---

## Python

Python is only used when you need an existing Python `palindrom-ai/` package.

### When to Use Python

| Package | Use Case |
|---------|----------|
| `palindrom-ai/llm` | LLM services, RAG, evals |
| `palindrom-ai/databricks-utils` | Data pipelines, PySpark |
| `palindrom-ai/livekit-agents` | Voice/video agents |

If your service doesn't need one of these packages, use TypeScript instead.

### When NOT to Use Python

Use TypeScript for:
- AWS Lambda functions
- Backend APIs (use Fastify via `palindrom-ai/fastify-base`)
- Frontend
- Infrastructure config
- CLI tools
- General backend services

**Note:** FastAPI is only used internally within `palindrom-ai/llm` — never build FastAPI services directly.

### Requirements

- All significant Python code should be abstracted into `palindrom-ai/` packages
- Standalone Python scripts are allowed but should be kept minimal (e.g., one-off scripts, simple utilities)
- If you're writing substantial Python, you're either:
  1. Contributing to an existing package, or
  2. Creating a new `palindrom-ai/` package

### Stack

| Tool | Purpose |
|------|---------|
| Python 3.12+ | Runtime |
| uv | Package manager |
| Ruff | Linting |
| pytest | Testing |

### Package Structure

Python code lives in dedicated package repos:

```
palindrom-ai/llm/           # LLM package
palindrom-ai/livekit-agents/       # LiveKit package
palindrom-ai/databricks-utils/  # Data utils
```

Application repos import these packages — they don't contain Python source code.
