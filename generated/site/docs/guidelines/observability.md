
## Observability

All application observability must use the `@palindrom/logging` package (Better Stack).

### Requirements

- Use `@palindrom/logging` for all logging and error tracking — never integrate Better Stack directly
- Use structured JSON logging with consistent fields
- Include `requestId` in all log entries for correlation
- Never log secrets, passwords, or unmasked API keys

### Installation

```bash
pnpm add @palindrom/logging
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

Refer to [palindrom-ai/logging](https://github.com/palindrom-ai/logging) for implementation details.
