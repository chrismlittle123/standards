---
id: conventions
title: Data Conventions
category: architecture
priority: 1
tags: [typescript, python, json, api, backend, frontend]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Data format conventions for JSON, dates, IDs, and naming"
---

## Data Conventions

Standard formats for data across all systems.

### JSON Casing

Use **camelCase** for all JSON we produce.

```json
{
  "userId": "usr_abc123",
  "createdAt": "2024-01-25T10:30:00Z",
  "isActive": true
}
```

Python code uses Pydantic aliases to maintain snake_case internally:

```python
class User(BaseModel):
    user_id: str = Field(alias="userId")
    created_at: datetime = Field(alias="createdAt")
```

### External Data (Consumed JSON)

Convert external data to camelCase at the system boundary.

| Scenario | Where to Convert |
|----------|------------------|
| Third-party API calls | API client/adapter |
| Incoming webhooks | Webhook handler |
| Data pipelines | Keep raw layer as-is, convert in silver/gold |

**Data pipelines exception:** Raw/bronze layers preserve original format for auditability. Convert to camelCase in transformation layers before serving via APIs.

```
External (snake_case) → Raw Storage (snake_case) → Transform → Gold (camelCase) → API (camelCase)
```

### Date and Time

Use ISO 8601 with UTC timezone for all timestamps.

| Format | Example |
|--------|---------|
| Datetime | `2024-01-25T10:30:00Z` |
| Date only | `2024-01-25` |

Never use Unix timestamps in APIs. Store as `timestamptz` in PostgreSQL.

### IDs

Use prefixed IDs for all resources.

| Resource | Prefix | Example |
|----------|--------|---------|
| User | `usr_` | `usr_abc123xyz` |
| Organization | `org_` | `org_def456xyz` |
| Request | `req_` | `req_ghi789xyz` |
| Session | `ses_` | `ses_jkl012xyz` |

Generate with: `{prefix}_{nanoid(21)}`

Why prefixes?
- Instantly identify resource type in logs
- Prevent ID collisions across tables
- Debug faster without context

### Null and Empty Values

| Scenario | Standard |
|----------|----------|
| Missing optional field | Omit the key |
| Empty array | Return `[]` (never omit) |
| Empty object | Return `{}` (never omit) |
| Explicit null | Only when "cleared" or "unset" has meaning |

```json
{
  "name": "Alice",
  "items": [],
  "metadata": {}
}
```

Not:

```json
{
  "name": "Alice",
  "bio": null,
  "items": null
}
```

### Booleans

Prefix with `is`, `has`, `can`, or `should`.

| Good | Bad |
|------|-----|
| `isActive` | `active` |
| `hasAccess` | `access` |
| `canEdit` | `editable` |
| `shouldNotify` | `notify` |

### Enums

Use SCREAMING_SNAKE_CASE for enum values.

```typescript
enum Status {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}
```

```json
{ "status": "IN_PROGRESS" }
```

### Money

Represent money as integers in the smallest unit (cents).

| Amount | Value |
|--------|-------|
| $10.00 | `1000` |
| $0.50 | `50` |

```json
{
  "amountCents": 1000,
  "currency": "USD"
}
```

Never use floats for money.

### Pagination

Use cursor-based pagination with consistent field names.

```json
{
  "data": [...],
  "nextCursor": "eyJpZCI6MTAwfQ",
  "hasMore": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Results |
| `nextCursor` | string | Opaque cursor for next page |
| `hasMore` | boolean | Whether more results exist |

Request: `GET /users?cursor=eyJpZCI6MTAwfQ&limit=20`

### API Versioning

Use URL path versioning.

```
/v1/users
/v2/users
```

Not headers, not query params.