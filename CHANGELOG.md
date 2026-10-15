# Changelog

Every tag of the registry, newest first. A major version names the
repositories it will break.

## standards-v1.1.0 (2026-10-15)

- The production templates use conform's new names for the two coverage
  checks: `code.coverage_measured` (was `code.coverage_run`) and
  `process.coverage_configured` (was `process.coverage`). conform still reads
  the old names, so a repository on either tag passes or fails exactly as
  before, whichever spelling its own `standards.toml` uses.

## standards-v1.0.0 (2026-10-15)

The first tag. Nothing extended the old rulesets, so no repository breaks.

- Nine templates replace the twelve old rulesets: `typescript`,
  `typescript-react` and `python`, each at prototype, internal and production.
  The `base-*` rulesets are gone, their process checks folded into each
  language template, and `typescript-frontend-*` is renamed `typescript-react-*`.
- File and folder naming is enforced in every template: kebab-case for
  TypeScript and JavaScript, snake_case for Python.
- Production adds an 80% line coverage floor, and the TypeScript production
  templates the pnpm dependency audit and a check that the test runner's own
  coverage thresholds stay configured.
- Branch names may start `session/`.
- No template checks GitHub Actions workflows.
- The guidelines, the hooks folder and the docs folder are removed.
