# standards

The ruleset registry for every repository under `chrismlittle123`: nine
templates that a repository's `standards.toml` extends, checked by
[conform](https://github.com/chrismlittle123/standards-kit).

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
  quietly: unused code, no silenced checks, stricter compiler flags,
  conventional commits and branch names.
- **production**: internal, plus pinned correctness rules, an 80% line
  coverage floor and a dependency audit.

The React templates differ from the plain TypeScript ones only by React rules
(hooks, and accessibility at production). A browser project that is not React
takes the plain template.

## Using one

```toml
[metadata]
tier = "production"

[extends]
registry = "github:chrismlittle123/standards@standards-v1.0.0"
rulesets = ["typescript-production"]

# Anything below overrides what the template set. Tables merge key by key;
# an array replaces the template's whole.
[code.coverage_run]
min_threshold = 64
```

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

Every template must pass before a tag is cut.
