---
id: testing
title: Testing
category: architecture
priority: 2
tags: [testing, unit, integration, e2e]
---

## Testing

### Folder Structure

Tests must be in a standalone `tests/` folder at the project root, never next to the source code.

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
