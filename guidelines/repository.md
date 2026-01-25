---
id: repository
title: Repository Standards
category: architecture
priority: 1
tags: [repository, metadata, standards]
---

## Repository Standards

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
