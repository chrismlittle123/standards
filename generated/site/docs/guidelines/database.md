
## Database

All databases use RDS PostgreSQL with Drizzle ORM.

### Stack

- RDS PostgreSQL
- Drizzle ORM
- Drizzle Kit for migrations

### Requirements

- All database access through Drizzle ORM
- Connection strings stored in AWS Secrets Manager
- Separate databases per environment (dev, staging, production)
- No direct database access from frontend

### Migrations

Run migrations with Drizzle Kit:

```bash
pnpm drizzle-kit generate  # Generate migration
pnpm drizzle-kit migrate   # Apply migration
```

Migrations are checked into version control and run in CI/CD before deployment.
