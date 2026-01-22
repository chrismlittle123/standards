
## Observability

All application observability must use the `palindrom-ai/monitoring` package (Better Stack).

### Requirements

- Use `palindrom-ai/monitoring` for all logging and error tracking — never integrate Better Stack directly
- Use structured JSON logging with consistent fields
- Include `requestId` in all log entries for correlation
- Never log secrets, passwords, or unmasked API keys

### Installation

**TypeScript:**
```bash
pnpm add palindrom-ai/monitoring
```

**Python:**
```bash
uv add palindrom-ai/monitoring
```

### Required Log Fields

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp |
| `level` | debug, info, warn, error |
| `message` | Human-readable message |
| `requestId` | Correlation ID |
| `service` | Service name |
| `environment` | development, staging, production |

### Log Levels

| Level | Use For |
|-------|---------|
| `debug` | Development only |
| `info` | Normal operations |
| `warn` | Recoverable issues |
| `error` | Failures requiring attention |

Refer to [palindrom-ai/monitoring](https://github.com/palindrom-ai/monitoring) for implementation details.
