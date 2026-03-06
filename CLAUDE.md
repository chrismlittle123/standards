# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the central registry of coding standards, guidelines, and rulesets for Progression Labs. It is consumed by the `@progression-labs-development/conform` MCP server, which dynamically composes relevant guidelines based on project context.

## Commands

| Task | Command |
|------|---------|
| Validate rulesets | `npx @progression-labs-development/conform validate registry` |
| Validate guidelines | `npx @progression-labs-development/conform validate guidelines ./guidelines` |

## Structure

```
guidelines/    # Markdown guideline documents
rulesets/      # TOML ruleset definitions (e.g., typescript-production.toml)
```

### Guidelines

Markdown files in `guidelines/` with YAML frontmatter. Required frontmatter fields:
- `id` — kebab-case identifier (must match `^[a-z][a-z0-9-]*$`)
- `title` — display name
- `category` — one of: `security`, `architecture`, `infrastructure`, `operations`, `data`, `reliability`
- `priority` — integer >= 1 (lower = higher priority, controls sort order)
- `tags` — array of kebab-case strings used by the MCP server for context matching

### Rulesets

TOML files in `rulesets/` defining tool configurations at different strictness tiers (production/internal/prototype) for TypeScript and Python. The TOML structure uses nested sections (e.g., `[code.linting.eslint.rules]`).

## Workflow

- This is a library repo — create feature branches from `main`
- Use conventional commits (`feat:`, `fix:`, `chore:`, etc.)

## MCP Tools

Use these to query the standards registry at any time:

| Tool | Purpose |
|------|---------|
| `get_standards` | Get guidelines matching a context string (e.g., `typescript fastapi`) |
| `list_guidelines` | List all available guidelines with metadata |
| `get_guideline` | Get a specific guideline by ID |
| `get_ruleset` | Get a ruleset by ID (e.g., `typescript-production`) |
