# Authentication & Authorization

**Status:** Standard
**Package:** [`@palindrom/auth`](https://github.com/palindrom-ai/auth)

---

## Overview

All authentication and authorization must go through the `@palindrom/auth` package. This package provides a unified auth interface across all Palindrom projects, with Clerk as the underlying provider.

**Do not integrate Clerk directly.** Use `@palindrom/auth` instead.

---

## Installation

```bash
pnpm add @palindrom/auth
```

---

## Supported Authentication Methods

The package supports (based on project requirements):

| Method | Status |
|--------|--------|
| Google OAuth | Supported |
| Microsoft OAuth | Supported |
| Email/Password | Supported |
| Magic Links | Available |
| MFA | Optional per-project |

Enable only what your project needs.

---

## Usage

Refer to the [`palindrom-ai/auth`](https://github.com/palindrom-ai/auth) repository for:

- Next.js integration
- Fastify middleware
- Protected routes patterns
- User session handling
- Role-based access control
- Webhook configuration

The package README is the source of truth for implementation details.

---

## Why This Exists

- **Consistency** — Same auth patterns across all projects
- **Upgrades** — Update Clerk version in one place
- **Defaults** — Sensible defaults for session handling, error responses, and security headers
- **Flexibility** — Enable/disable features per project without reimplementing

---

## When to Deviate

If a project has auth requirements not covered by `@palindrom/auth`:

1. Check if the feature should be added to the package (preferred)
2. If project-specific, document the deviation in an ADR
3. Never bypass the package for convenience — extend it instead
