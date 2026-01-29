---
id: repository
title: Repository Standards
category: architecture
priority: 1
tags: [repository, metadata, standards]
author: Engineering Team
lastUpdated: "2024-03-15"
summary: "Repository metadata, structure, and documentation standards"
---

## Repository Standards

### Code Quality (Production)

We aim for an **8/10 codebase** at all times in production repositories.

**The definition:** if you asked 100 instances of Claude Code to review the repository and averaged the scores, what would that score be? It should be 8/10. No more, no less.

- **9/10** — We're wasting time on polish that doesn't deliver value
- **Below 8/10** — We're creating tech debt that will slow us down

Prototypes can move faster.

### standards.toml

Every repository must have a `standards.toml` file. See [TypeScript](./typescript.md) and [Python](./python.md) guidelines for language-specific configuration.