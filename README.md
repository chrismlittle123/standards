# standards

The ruleset registry for every repository under `chrismlittle123`: nine
templates that a repository's `standards.toml` extends, checked by
conform, the standards checker in the private `chrismlittle123/standards-kit`
repository.

## The templates

One per language and tier. A repository names exactly one.

| | prototype | internal | production |
|---|---|---|---|
| TypeScript | `typescript-prototype` | `typescript-internal` | `typescript-production` |
| TypeScript and React | `typescript-react-prototype` | `typescript-react-internal` | `typescript-react-production` |
| Python | `python-prototype` | `python-internal` | `python-production` |

- **prototype**: it lints, it compiles, nothing secret is committed, and files
  are named consistently. Nothing is lost if it breaks.
- **internal**: prototype, plus the checks that stop a repository rotting
  quietly: unused code, no silenced checks, stricter compiler flags.
- **production**: internal, plus an 80% line coverage floor and a dependency
  audit, and for TypeScript pinned correctness rules.

The React templates differ from the plain TypeScript ones by React rules
(hooks, and accessibility at production) and by allowing dynamic route folder
names such as `[id]` and `(group)`. A browser project that is not React takes
the plain template.

## Using one

```toml
[metadata]
tier = "production"

[extends]
registry = "github:chrismlittle123/standards@standards-v1.2.1"
ruleset = "typescript-production"

# Anything below overrides what the template set. Tables merge key by key;
# an array replaces the template's whole.
[code.coverage_measured]
min_threshold = 64
```

`standards-v1.1.0` and later need conform 1.0.0 or later. `ruleset = "x"`
needs conform 2.0.0 (`conform-v2.0.0`); conform 2 still reads the older
`rulesets = ["x"]` until 3.0.0.

Always pin a tag, never a branch: a template change then reaches a repository
only when that repository moves its pin, and the pin is the record of which
standard it meets.

## Versions

Tagged `standards-vX.Y.Z` for the whole registry, recorded in
[CHANGELOG.md](CHANGELOG.md):

- **major**: a repository that passed can now fail.
- **minor**: a new template, or a loosening.
- **patch**: comments and docs, no change to what is checked.

## Checking a change

```bash
conform validate registry
```

conform is not on npm. From a standards-kit checkout, run it as
`node dist/cli.js validate registry` after `pnpm build`.

Every template must pass before a tag is cut.
