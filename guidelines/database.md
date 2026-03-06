---
id: database
title: Database
category: infrastructure
priority: 4
tags: [typescript, database, postgresql, drizzle, orm, backend]
author: Engineering Team
lastUpdated: "2025-02-26"
summary: "Database standards for PostgreSQL, Drizzle ORM, and migrations"
---

## Database

All databases use RDS PostgreSQL with Drizzle ORM.

### Stack

- RDS PostgreSQL
- Drizzle ORM
- Drizzle Kit for migrations

### Requirements

- All database access through Drizzle ORM
- Connection strings stored in the platform's secrets manager
- Separate databases per environment (dev, stag, prod)
- No direct database access from frontend

### Migrations

Run migrations with Drizzle Kit:

```bash
pnpm drizzle-kit generate  # Generate migration
pnpm drizzle-kit migrate   # Apply migration
```

Migrations are checked into version control and run in CI/CD before deployment.