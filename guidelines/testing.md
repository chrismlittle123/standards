---
id: testing
title: Testing
category: architecture
priority: 2
tags: [testing, unit, integration, e2e]
author: Engineering Team
lastUpdated: "2024-03-15"
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