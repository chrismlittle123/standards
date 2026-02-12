# Agent Instructions

## Project Overview

standards is the central registry of coding standards, guidelines, and rulesets. Built with TypeScript.

- **Tier:** internal
- **Package:** `standards` (registry)

## Quick Reference

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Generate | `pnpm generate` |

## Architecture

```
guidelines/    # Markdown guideline documents
rulesets/      # TOML ruleset definitions (e.g., typescript-production.toml)
generated/     # Auto-generated output (do not edit directly)
scripts/       # Build/generation scripts
templates/     # Templates (e.g., CLAUDE.md.template)
```

## Standards & Guidelines

This project is the standards registry itself — it defines the guidelines and rulesets consumed by all other repos.

- **Guidelines:** https://chrismlittle123.github.io/standards/
- **Rulesets:** `rulesets/*.toml` define tool configurations per tier

Use the MCP tools to query standards at any time:

| Tool | Purpose |
|------|---------|
| `get_standards` | Get guidelines matching a context (e.g., `typescript fastapi`) |
| `list_guidelines` | List all available guidelines |
| `get_guideline` | Get a specific guideline by ID |
| `get_ruleset` | Get a tool configuration ruleset (e.g., `typescript-production`) |

## Workflow

- **Branch:** Create feature branches from `main`
- **CI:** GitHub Actions validates and builds
- **Deploy:** GitHub Pages serves the guidelines site on push to `main`
- **Commits:** Use conventional commits (`feat:`, `fix:`, `chore:`, etc.)

## Project-Specific Notes

- The `generated/` directory is auto-generated — run `pnpm generate` after modifying guidelines or rulesets
- Adding a new guideline: create a markdown file in `guidelines/`, then regenerate
- Adding a new ruleset: create a TOML file in `rulesets/`, then regenerate
