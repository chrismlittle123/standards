---
id: auth
title: Authentication
category: security
priority: 1
---

## Authentication

All services must use the shared auth SDK for token validation.

### Requirements

- Use the shared auth library for all token validation
- Never validate JWTs manually
- Always verify `aud` and `iss` claims
- Return 401 for invalid tokens, 403 for insufficient permissions
- Use short-lived access tokens with refresh token rotation

### Example

```typescript
import { withAuth, requirePermissions } from '@company/auth-sdk';

// Apply auth middleware
app.use(withAuth({
  audience: 'https://api.company.com',
  issuer: 'https://auth.company.com',
}));

// Require specific permissions for routes
app.delete('/users/:id', requirePermissions(['users:delete']), deleteUser);
```

### Error Responses

```typescript
// 401 Unauthorized - missing or invalid token
{ "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired token" } }

// 403 Forbidden - valid token but insufficient permissions
{ "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" } }
```
