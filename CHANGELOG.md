# Changelog

Every tag of the registry, newest first. A major version names the
repositories it will break.

## standards-v4.1.0 (2026-10-26)

Minor: a loosening, so nothing that passed can fail.

- The internal templates, TypeScript, TypeScript and React, and Python, turn
  `code.mutation_score` off: mutation testing is for production only (60).
  At internal it needed a tool and per-repo setup in every repository for a
  weak signal at 40, and several internal repositories have no tests to run
  it against. `mutants/` leaves the Python internal template's forbidden
  files with it.

## standards-v4.0.0 (2026-10-23)

Major: a repository that passed can now fail. Needs conform 2.2.0.

- The production and internal templates, TypeScript and Python, turn on
  `code.mutation_score`, mutation testing. The tests run against small
  changes to the code, and the score is the share they catch, of the changes
  in code they run. production: 60. internal: 40. prototype: off. A
  TypeScript repo adds `@stryker-mutator/core` and the runner for its vitest
  or jest. A Python repo adds `mutmut`, puts `mutants/` in .gitignore, and
  names `source_paths` in `[tool.mutmut]`. A repo with no tests turns the
  check off in its own config, as it does coverage.
- The Python templates turn on `code.duplication.jscpd`, which conform 2.2.0
  runs from its own install. It's the same tiers as TypeScript: production,
  every clone of 50 tokens or more; internal, 100 or more; prototype, 100 or
  more, allowed up to 5% of the code. Test files and the top-level test
  folders are left out. `mutants/` joins the Python production template's
  forbidden files.
- Breaks, until each is set up: every production and internal repo, until
  the mutation tool is installed. After that:
  - life-admin: 102 clones, and a score of about 54%.
  - guitar: a test that reads the source fails in Stryker's sandbox.
  - flaude: its code is in `server/`, so `mutate` must be set.
  - my-site, cv-builder and personal-vault: no tests.

## standards-v3.0.0 (2026-10-22)

Major: a repository that passed can now fail. Needs conform 2.1.2.

- The TypeScript templates' duplication check leaves out test files by name
  anywhere, and the top-level `test/`, `tests/` and `e2e/` folders, in place
  of any folder named `tests` or `test` at any depth. A folder named tests
  deeper in the source (guitar's quiz UI) is code and is now checked.
- Breaks, until its clones are merged: guitar (37 clones).

## standards-v2.0.0 (2026-10-22)

Major: a repository that passed can now fail. Needs conform 2.1.0 and jscpd as
a dev dependency.

- The six TypeScript templates turn on `code.duplication.jscpd`, which finds
  code written twice, outside the tests. production: every clone of 50 tokens
  or more is a finding. internal: 100 tokens or more. prototype: 100 tokens or
  more, allowed up to 5% of the code. No percentage at internal or
  production: the only way to clear a clone is to merge the copies. The Python
  templates don't change (jscpd needs Node).
- Breaks, until their clones are merged: flaude (21 clones), guitar (196),
  standards-kit (10).

## standards-v1.2.1 (2026-10-22)

Docs only; nothing checked changes.

- The README uses conform 2.0.0's `ruleset = "x"` and its CLI path,
  `dist/cli.js`. No template changes for conform 2.0.0: nothing in them is
  rejected by it.

## standards-v1.2.0 (2026-10-22)

A loosening: no repository that passed can now fail.

- Branch names and commit messages leave the internal and production
  templates (`process.branches`, `process.commits`). They belong to the coding
  agent that makes them, not to a repository's standard (standards-kit's
  decision D4). A repository that wants them names them in its own
  `standards.toml`.

## standards-v1.1.2 (2026-10-15)

Docs only; nothing checked changes.

- The README names the conform that `standards-v1.1.0` and later need:
  1.0.0, now released.

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
