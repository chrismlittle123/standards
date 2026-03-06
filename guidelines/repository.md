---
id: repository
title: Repository Standards
category: architecture
priority: 1
tags: [repository, metadata, standards]
author: Engineering Team
lastUpdated: "2025-02-26"
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

Every repository has two levels of `standards.toml`:

1. **Root `standards.toml`** — Process standards (commits, hooks, branch protection). Uses a `base-*` ruleset.
2. **Per-project `standards.toml`** — Code standards (linting, types, security). Uses a language-specific ruleset.

**Root standards.toml:**
```toml
[standards]
ruleset = "base-production"  # or base-internal, base-prototype
```

**Per-project standards.toml:**
```toml
[standards]
ruleset = "typescript-production"  # or python-internal, etc.
```

In a monorepo, the root handles process and each app/package has its own code standards. In a single-project repo, you still have both files — root for process, project for code.

Available base rulesets:
- `base-production` — Pre-push + commit-msg hooks, active branch protection, conventional commits
- `base-internal` — Commit-msg hook only, evaluate-only branch protection, conventional commits
- `base-prototype` — Conventional commits only (no hooks, no branch protection)

Base rulesets default to protecting the `prod` branch. Library repos must override this in their root `standards.toml`:

```toml
[standards]
ruleset = "base-production"
branch = "main"
```

### README

Every repository must have a `README.md` that includes:

- What the project does (one sentence)
- How to install and run it locally
- Environment variables required
- How to run tests

### .gitignore

Every repository must have a `.gitignore`. At minimum, ignore:

- `node_modules/`, `.venv/`, `dist/`, `build/`
- `.env` and `.env.*` (except `.env.example`)
- OS files (`.DS_Store`, `Thumbs.db`)
- IDE config (`.idea/`, `.vscode/` — except shared settings)

### Branching

| Repo type | Branches | Default branch |
|-----------|----------|----------------|
| Deployment repos (APIs, frontends, infra) | `dev`, `stag`, `prod` | `dev` |
| Library repos (shared packages) | `main` | `main` |

See [CI/CD guideline](./ci-cd.md) for full branching strategy and deployment flow.

### Branch Protection

Production and internal repositories must enable branch protection on the `prod` branch (or `main` for library repos).

### Git Hooks

**Production** repositories must use Husky for Git hooks:

- `pre-push` — lint and type check before pushing
- `commit-msg` — validate conventional commit format

**Internal** repositories require only:

- `commit-msg` — validate conventional commit format

Prototype repositories may skip hooks to move faster.