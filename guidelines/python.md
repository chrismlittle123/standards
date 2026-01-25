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

| Package / Platform | Use Case |
|--------------------|----------|
| `palindrom-ai/llm` | LLM services, RAG, evals |
| `palindrom-ai/databricks-utils` | Data pipelines, PySpark |
| `palindrom-ai/livekit-agents` | Voice/video agents |
| AWS Lambda | Data engineering, ETL triggers, S3 event handlers |

**Why Python for Lambda?** The Python Lambda ecosystem is mature with well-tested patterns for data engineering workflows. All Lambda functions are exclusively for data pipelines, not APIs.

If your service doesn't need one of these, use TypeScript instead.

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
| uv | Package manager (required) |
| Ruff | Linting |
| pytest | Testing |

### uv Requirements

Use Python 3.12+ for all projects. uv is the **only** permitted package manager. Do not use pip, poetry, pipenv, or conda.

```bash
uv init              # New projects
uv add <pkg>         # Add dependencies (not pip install)
uv sync              # Install from lockfile
uv run <cmd>         # Run commands in venv
uvx <tool>           # Run CLI tools
```

Commit both `pyproject.toml` and `uv.lock` to version control.

### Package Structure

Python code lives in dedicated package repos:

```
palindrom-ai/llm/           # LLM package
palindrom-ai/livekit-agents/       # LiveKit package
palindrom-ai/databricks-utils/  # Data utils
```

Application repos import these packages — they don't contain Python source code.
