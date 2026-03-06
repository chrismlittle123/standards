---
id: testing
title: Testing
category: architecture
priority: 2
tags: [typescript, python, testing, unit, integration, e2e, vitest, pytest]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Testing standards for unit, integration, and e2e tests"
---

## Testing

### Folder Structure

Tests must be in a standalone `tests/` folder at the project root (not the repository root), never next to the source code.

```
project/
├── src/
│   └── ...
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json / pyproject.toml
```

### Test Types

| Type | Can run without... | What it implies |
|------|-------------------|-----------------|
| Unit | Internet | No external dependencies. Pure logic. Mocked everything. |
| Integration | UI | Real services talking to each other, but headless. APIs, databases, queues. |
| E2E | Human | Full system, real UI, automated browser/device. The robot pretends to be a user. |

### Frameworks

| Language | Framework | Runner |
|----------|-----------|--------|
| TypeScript | Vitest | `pnpm vitest` |
| Python | pytest | `uv run pytest` |

### Coverage

- Production repositories should target 80%+ coverage on business logic
- Integration and E2E tests count toward coverage
- Don't chase 100% — focus coverage on code paths that matter (business logic, error handling, edge cases)

### CI Integration

Tests run automatically in CI via `progression-labs-development/github-actions`:

- Unit and integration tests run on every PR
- E2E tests run before merging to `stag` and `prod`
- Tests must pass before deployment

### What NOT to Test

- Framework boilerplate (route registration, middleware wiring)
- Simple data transformations that types already guarantee
- Third-party library internals