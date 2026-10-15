# CLAUDE.md

## What this is

The ruleset registry conform reads through a repository's `[extends]`: nine
TOML templates in `rulesets/`, one per language (TypeScript, TypeScript and
React, Python) and tier (prototype, internal, production). Nothing else lives
here: no guidelines, no git hooks, no code. `.claude/` holds only Claude Code's
own settings.

## Commands

| Task | Command |
|------|---------|
| Validate the templates | `conform validate registry` (from standards-kit: `node packages/conform/dist/cli.js validate registry`) |
| Check this repo | `conform check` |

## Rules for changing a template

- A template cannot extend another template, so each one is standalone and
  repeats what the tier below it has.
- Every change gets a `CHANGELOG.md` line and a tag, `standards-vX.Y.Z`.
  Major when a repository that passed can now fail, minor for a new template or
  a loosening, patch for comments only. The changelog names which repositories
  a major will break.
- Never move a tag that exists. Repositories pin tags and move their own pin.
- Validate all nine before tagging.

## Workflow

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, ...).
