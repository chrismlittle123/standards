---
type: features
title: Standards Registry Features
owner: chris-little
last_reviewed: 2026-03-03
---

# Standards Registry Features

## Core Features

- Shared base process rulesets for internal, production, and prototype repositories
- Shared language and platform rulesets for TypeScript, Python, and frontend repositories
- Atomic guideline documents with structured metadata for retrieval and composition
- Central repository docs contract for internal and production repos
- Registry validation for shared rulesets and guidelines

## Repository Docs Policy

Internal and production repositories that extend shared base rulesets inherit:

- required `README.md`
- required `CLAUDE.md`
- required `docs/ARCHITECTURE.md`
- required `docs/FEATURES.md`
- required frontmatter fields for `architecture` and `features`
- required `Overview` section for `architecture`

## Non-Features

- This repo does not automatically retrofit repos that do not extend shared base rulesets
- This repo does not auto-allowlist repository-specific markdown outside `docs/`
- This repo does not manage per-repo content beyond shared ruleset inheritance
