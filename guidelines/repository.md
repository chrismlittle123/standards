---
id: repository
title: Repository Standards
category: architecture
priority: 1
tags: [repository, metadata, standards]
---

## Repository Standards

### Code Quality (Production)

We aim for an **8/10 codebase** at all times in production repositories.

If a team or LLM were asked "how clean/organised/well-designed is this code repo?" they would answer 8/10. No more, no less.

- **9/10** — We're wasting time on polish that doesn't deliver value
- **Below 8/10** — We're creating tech debt that will slow us down

This applies to production-tier repositories only. Prototypes can move faster.

### Metadata Files

Every repository must include standard metadata files.

### repo-metadata.yaml

Every repository must have a `repo-metadata.yaml` file in the root directory.

```yaml
tier: production  # Required: production, internal, or prototype
```

**Tiers:**

| Tier | Description |
|------|-------------|
| `production` | Customer-facing services, strictest standards |
| `internal` | Internal tools and services |
| `prototype` | Experimental projects, relaxed standards |

The tier determines which ruleset `check-my-toolkit` applies and affects CI/CD pipeline behavior.

### check.toml

Every repository must have a `check.toml` file. See [TypeScript](./typescript.md) and [Python](./python.md) guidelines for language-specific configuration.
