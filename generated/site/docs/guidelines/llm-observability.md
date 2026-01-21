
## LLM Observability

All LLM observability must use the `palindrom-ai/llm` Python package (Langfuse).

### Requirements

- Use `palindrom-ai/llm` for all LLM tracing — never integrate Langfuse directly
- Include metadata on all LLM calls: project, feature, userId
- Use the same `requestId` as app logs for correlation

### Installation

```bash
pip install palindrom-llm
```

### Required Metadata

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

Refer to [palindrom-ai/llm](https://github.com/palindrom-ai/llm) for implementation details.
