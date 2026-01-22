# Typescript Frontend Internal

<!-- AUTO-GENERATED — DO NOT EDIT -->
<!-- Run "pnpm generate" to update -->

## Code

### Linting

#### Eslint

#### Rules

| Rule | Config |
|------|--------|
| `max-depth` | { severity: error, max: 4 } |
| `max-params` | { severity: error, max: 4 } |
| `max-lines-per-function` | { severity: error, max: 100 } |
| `max-lines` | { severity: error, max: 500 } |
| `complexity` | `error` |
| `no-console` | { severity: error, allow: error,warn } |
| `eqeqeq` | `error` |
| `prefer-const` | `error` |
| `no-var` | `error` |
| `no-eval` | `error` |
| `no-implied-eval` | `error` |
| `array-callback-return` | `error` |
| `no-template-curly-in-string` | `error` |
| `consistent-return` | `error` |
| `import/no-cycle` | `off` |
| `@typescript-eslint/no-unused-vars` | { severity: error, argsIgnorePattern: ^_, varsIgnorePattern: ^_ } |
| `@typescript-eslint/no-explicit-any` | `error` |
| `@typescript-eslint/no-non-null-assertion` | `error` |
| `@typescript-eslint/no-empty-object-type` | `off` |

### Types

#### Tsc

#### Require

| Option | Value |
|--------|-------|
| `strict` | `true` |
| `noImplicitAny` | `true` |
| `strictNullChecks` | `true` |
| `noUnusedLocals` | `true` |
| `noImplicitReturns` | `true` |
| `noFallthroughCasesInSwitch` | `true` |
| `esModuleInterop` | `true` |
| `skipLibCheck` | `true` |
| `forceConsistentCasingInFileNames` | `true` |

### Security

#### Secrets

- **enabled**: `true`

#### Pnpmaudit

- **enabled**: `true`

### Unused

#### Knip

- **enabled**: `true`

### Naming

- **enabled**: `true`
- **rules**: `[object Object]`, `[object Object]`
