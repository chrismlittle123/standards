---
type: architecture
title: Standards Registry Architecture
owner: chris-little
last_reviewed: 2026-03-03
tracks: guidelines,rulesets
---

# Standards Registry Architecture

## Overview

The `standards` repository is the central source of truth for shared coding standards and shared process rulesets across the Progression Labs GitHub organization.

It has two primary outputs:

1. guideline markdown used by standards retrieval and composition
2. TOML rulesets consumed by repositories through `standards.toml` extends

## Repository Structure

- `guidelines/`
  Atomic standards documents with structured metadata for retrieval and composition.
- `rulesets/`
  Shared `conform` rulesets such as `base-internal`, `base-production`, and language-specific layers.
- `docs/`
  Repository-level product and architecture documentation.

## Consumption Model

Repositories consume this repo by extending shared rulesets:

```toml
[extends]
registry = "github:progression-labs-dev/standards"
rulesets = ["base-internal"]
```

`conform` resolves the registry, merges the selected rulesets with repo-local config, and then evaluates code and process checks.

## Documentation Contract

`base-internal` and `base-production` define the canonical repository docs contract for internal and production repositories:

- `README.md`
- `CLAUDE.md`
- `docs/ARCHITECTURE.md`
- `docs/FEATURES.md`

The frontmatter contract for `architecture` and `features` docs is defined in the shared rulesets so downstream repos inherit it automatically.

## Change Model

Changes in this repo affect downstream repositories in two ways:

1. ruleset changes alter enforcement behavior in repos that extend them
2. guideline changes alter the guidance returned by standards tooling

That makes changes here high leverage and potentially breaking if rolled out carelessly.
