---
id: observability
title: Observability
category: operations
priority: 2
---

## Observability

Instrument all services with structured logging, metrics, and tracing.

### Requirements

- Use structured JSON logging with consistent field names
- Include `requestId`, `userId`, and `traceId` in all log entries
- Log at appropriate levels: `debug` for development, `info` for normal operations, `warn` for recoverable issues, `error` for failures
- Never log sensitive data (passwords, tokens, PII)

### Logging Example

```typescript
import { logger } from '@company/observability';

logger.info('Request processed', {
  requestId: ctx.requestId,
  userId: ctx.user?.id,
  duration: Date.now() - startTime,
  endpoint: req.path,
  status: res.statusCode,
});
```

### Metrics

- Track request count, latency percentiles, and error rates
- Use consistent metric naming: `service_operation_unit`
- Add relevant labels but avoid high cardinality
