---
id: auth
title: Authentication
category: security
priority: 1
---

## Authentication

All authentication must use the `@palindrom/auth` package.

### Requirements

- Use `@palindrom/auth` for all authentication — never integrate Clerk directly
- Enable only the auth methods your project needs (Google, Microsoft, Email/Password)
- MFA is optional and configured per-project
- Refer to the [palindrom-ai/auth](https://github.com/palindrom-ai/auth) repository for implementation details

### Installation

```bash
pnpm add @palindrom/auth
```

### Supported Methods

| Method | Status |
|--------|--------|
| Google OAuth | Supported |
| Microsoft OAuth | Supported |
| Email/Password | Supported |
| Magic Links | Available |
| MFA | Optional |

### Deviations

If your project needs auth features not in `@palindrom/auth`, extend the package rather than bypassing it. Document any project-specific deviations in an ADR.
