---
id: auth
title: Authentication
category: security
priority: 1
tags: [typescript, python, auth, security, backend]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Authentication patterns and session management standards"
---

## Authentication

All authentication uses Clerk, accessed through the appropriate wrapper for each layer.

### Requirements

- **Backend APIs:** Use `progression-labs-development/auth` (Fastify plugin wrapping `@clerk/backend`) — never import `@clerk/backend` directly in application code
- **Frontends:** Use `@clerk/nextjs` directly — the auth package does not cover the frontend layer
- Enable only the auth methods your project needs (Google, Microsoft, Email/Password)
- MFA is optional and configured per-project
- Refer to the [progression-labs-development/auth](https://github.com/progression-labs-development/auth) repository for implementation details

### Integration

- **TypeScript APIs:** `progression-labs-development/fastify-api` includes the auth middleware from `progression-labs-development/auth`
- **Python LLM services:** `progression-labs-development/llm` includes auth validation
- **Frontends:** Use `@clerk/nextjs` for client-side auth (sign-in, sign-up, session management)
- **Frontend BFF:** Auth token exchange in Next.js API routes is allowed for the BFF layer

### Supported Methods

| Method | Status |
|--------|--------|
| Google OAuth | Supported |
| Microsoft OAuth | Supported |
| Email/Password | Supported |
| Magic Links | Available |
| MFA | Optional |

### Deviations

If your project needs auth features not in `progression-labs-development/auth`, extend the package rather than bypassing it. Document any project-specific deviations in an ADR.