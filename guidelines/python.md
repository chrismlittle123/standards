---
id: python
title: Python
category: architecture
priority: 2
tags: [python, llm, livekit-agents]
---

## Python

Python is only used when you need an existing Python `palindrom-ai/` package.

### When to Use Python

| Package / Platform | Use Case |
|--------------------|----------|
| `palindrom-ai/llm` | LLM services, RAG, evals |
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
| ty | Type checking |
| Pydantic | Data modeling |
| pytest | Testing |

### Test Structure

Tests must be in a standalone `tests/` folder at the project root, never next to the source code.

```
project/
├── src/
│   └── mypackage/
│       └── ...
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── pyproject.toml
```

### Data Modeling

**Never use `dict` when the structure is known.** Use Pydantic models instead.

In 80%+ of cases, the structure of your data is known at development time. When this is the case, always define a Pydantic class rather than passing around dictionaries.

```python
# Bad - avoid this
def process_user(user: dict) -> dict:
    return {"id": user["id"], "name": user["name"].upper()}

# Good - use Pydantic
class User(BaseModel):
    id: str
    name: str

class ProcessedUser(BaseModel):
    id: str
    name: str

def process_user(user: User) -> ProcessedUser:
    return ProcessedUser(id=user.id, name=user.name.upper())
```

**Why Pydantic over dict:**
- Type safety and IDE autocompletion
- Automatic validation at runtime
- Clear documentation of data shape
- Easier refactoring
- Better error messages

**When `dict` is acceptable:**
- Truly dynamic data with unknown keys
- Passing through unstructured JSON from external sources (temporarily)
- Performance-critical hot paths (rare)

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
palindrom-ai/llm/              # LLM package
palindrom-ai/livekit-agents/   # LiveKit package
```

Application repos import these packages — they don't contain Python source code.

### Standards Enforcement

Use `check-my-toolkit` to enforce Palindrom standards.

```bash
uv add --dev check-my-toolkit
```

Every repository must have a `check.toml` in the root that specifies which ruleset to use:

```toml
[check-my-toolkit]
ruleset = "python-production"  # or python-internal, python-prototype
```

Available rulesets:
- `python-production` — Customer-facing services (strictest)
- `python-internal` — Internal tools and services
- `python-prototype` — Experimental projects (most relaxed)

Run in CI to validate project structure and configuration against Palindrom standards.
