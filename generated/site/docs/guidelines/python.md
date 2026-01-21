
## Python

Python is only used when you need an existing Python `palindrom-ai/` package.

### When to Use Python

| Package | Use Case |
|---------|----------|
| `palindrom-ai/llm` | LLM services, RAG, evals |
| `palindrom-ai/databricks-utils` | Data pipelines, PySpark |
| `palindrom-ai/livekit` | Voice/video agents |

If your service doesn't need one of these packages, use TypeScript instead.

### When NOT to Use Python

Use TypeScript for:
- AWS Lambda functions
- Backend APIs (use Fastify, not FastAPI)
- Frontend
- Infrastructure config
- CLI tools
- General backend services

### Requirements

- All Python code MUST be abstracted into `palindrom-ai/` packages
- No standalone Python scripts in application repos
- If you're writing Python, you're either:
  1. Contributing to an existing package, or
  2. Creating a new `palindrom-ai/` package

### Stack

| Tool | Purpose |
|------|---------|
| Python 3.12+ | Runtime |
| uv | Package manager |
| Ruff | Linting & formatting |
| pytest | Testing |

### Package Structure

Python code lives in dedicated package repos:

```
palindrom-ai/llm/           # LLM package
palindrom-ai/livekit/       # LiveKit package
palindrom-ai/databricks-utils/  # Data utils
```

Application repos import these packages — they don't contain Python source code.
