# LLM Observability

**Status:** Standard
**Package:** [`palindrom-ai/llm`](https://github.com/palindrom-ai/llm)

---

## Overview

All LLM observability must go through the `palindrom-ai/llm` Python package. This package provides unified LLM call tracing, token tracking, cost monitoring, and evaluation capabilities, with Langfuse as the underlying provider.

**Do not integrate Langfuse directly.** Use `palindrom-ai/llm` instead.

For application-level observability (logs, errors, uptime), see [Observability](./observability.md).

---

## Installation

```bash
pip install palindrom-llm
# or
uv add palindrom-llm
```

---

## What It Covers

| Concern | Included |
|---------|----------|
| LLM call traces | Prompt, response, model, latency |
| Token usage | Input/output tokens per call |
| Cost tracking | Spend per project, feature, user |
| Multi-step traces | Agent workflows, chains |
| Evaluation | Scoring, LLM-as-judge |
| Prompt management | Versioning, A/B testing |

---

## Usage

Refer to the [`palindrom-ai/llm`](https://github.com/palindrom-ai/llm) repository for:

- Basic LLM call tracing
- Agent workflow tracing
- Cost tracking setup
- Evaluation frameworks
- Prompt versioning

The package README is the source of truth for implementation details.

---

## Required Metadata

All LLM calls should include:

| Field | Description |
|-------|-------------|
| `project` | Project identifier |
| `feature` | Feature or use case name |
| `userId` | User who triggered the call (if applicable) |
| `sessionId` | Conversation/session ID (if applicable) |
| `requestId` | Correlation ID (links to app logs) |

---

## Correlation with App Logs

Use the same `requestId` in both `@palindrom/logging` and `palindrom-ai/llm` to correlate:

- Better Stack error → Langfuse LLM trace
- LLM latency spike → App request that triggered it

---

## What to Track

| Always | Optional |
|--------|----------|
| Model used | User feedback |
| Token count | Evaluation scores |
| Latency | Prompt version |
| Cost | A/B variant |
| Success/failure | Retrieved context (RAG) |

---

## Why This Exists

- **Cost visibility** — Know what you're spending per project/feature
- **Debugging** — Replay and inspect LLM calls
- **Quality** — Track regressions with evaluations
- **Optimization** — Identify slow or expensive calls
