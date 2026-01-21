
## Error Handling

Use structured error handling with proper error types and consistent responses.

### Requirements

- Define domain-specific error classes that extend a base `AppError`
- Include error codes, HTTP status, and user-safe messages
- Never expose stack traces or internal details in production responses
- Log full error context server-side before sanitizing for clients

### Example

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```
