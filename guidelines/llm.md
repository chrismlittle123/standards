---
id: llm
title: LLM Services
category: operations
priority: 3
tags: [python, llm, langfuse, observability, ai, rag, evals]
---

## LLM Services

Use the `palindrom-ai/llm` package for all LLM functionality.

### Requirements

- Use `palindrom-ai/llm` for all LLM calls — never integrate providers directly
- Use `palindrom-ai/llm` for all LLM observability — never integrate Langfuse directly
- Use `palindrom-ai/llm` for RAG and evaluations

### Installation

```bash
pip install palindrom-ai/llm
```

### What the Package Provides

| Feature | Description |
|---------|-------------|
| Unified API | Single interface for OpenAI, Anthropic, Google |
| Observability | Tracing, token counts, latency, cost via Langfuse |
| RAG | Retrieval-augmented generation utilities |
| Evals | DeepEval wrapper for testing LLM outputs |
| Fallbacks | Primary model fails → backup |
| Cost tracking | Per project, feature, user |

### Required Metadata

All LLM calls must include:

| Field | Description |
|-------|-------------|
| `project` | Project identifier |
| `feature` | Feature or use case name |
| `userId` | User who triggered the call |
| `requestId` | Correlation ID (links to app logs) |

### What Gets Tracked

- Model used
- Token count (input/output)
- Latency
- Cost
- Success/failure
- Prompt and response content

### Correlation with App Logs

Use the same `requestId` in both `palindrom-ai/logging` and `palindrom-ai/llm` to correlate:
- Better Stack error → Langfuse LLM trace
- LLM latency spike → App request that triggered it

### What NOT to Do

- Import OpenAI/Anthropic/Google SDKs directly
- Integrate Langfuse directly
- Skip metadata on LLM calls
- Use different correlation IDs between app and LLM logs

Refer to [palindrom-ai/llm](https://github.com/palindrom-ai/llm) for full documentation.
