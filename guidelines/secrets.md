---
id: secrets
title: Secrets Management
category: security
priority: 1
---

## Secrets Management

Never hardcode secrets. Use environment variables or a secrets manager.

### Requirements

- Load secrets from environment variables or a secrets manager at runtime
- Never commit secrets to version control
- Use `.env.example` files to document required variables (without values)
- Rotate secrets regularly and support zero-downtime rotation

### Environment Variables

```typescript
// config.ts
const config = {
  database: {
    url: requireEnv('DATABASE_URL'),
    poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10'),
  },
  auth: {
    jwtSecret: requireEnv('JWT_SECRET'),
    sessionSecret: requireEnv('SESSION_SECRET'),
  },
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
```

### .gitignore

Always include:
```
.env
.env.local
.env.*.local
*.pem
*.key
```
