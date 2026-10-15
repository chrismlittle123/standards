# Changelog

Every tag of the registry, newest first. A major version names the
repositories it will break.

## standards-v1.1.1 (2026-10-15)

Comments and docs only; nothing checked changes.

- The naming comment no longer says scripts are never checked: `.js` and
  `.mjs` scripts are judged like any other code.
- The README says which conform each tag needs, that pinned correctness rules
  are TypeScript's only, and that the React templates also allow dynamic route
  folder names.

## standards-v1.1.0 (2026-10-15)

Needs a conform newer than 0.5.4: conform 0.5.4 rejects the renamed sections
as unrecognized keys. Stay on standards-v1.0.0 until that conform is released.

- The production templates use conform's new names for the two coverage
  checks: `code.coverage_measured` (was `code.coverage_run`) and
  `process.coverage_configured` (was `process.coverage`). That conform still
  reads the old names, so a repository on either tag passes or fails exactly as
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
