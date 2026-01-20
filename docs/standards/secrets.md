# Secrets Management

**Status:** Standard

---

## Overview

All secrets must be stored in **AWS Secrets Manager**. No local `.env` files.

| Environment | Access Method |
|-------------|---------------|
| Local development | AWS SSO |
| CI/CD (GitHub Actions) | OIDC |

---

## Rules

1. **No `.env` files** — Never store secrets in `.env` files, even locally
2. **No secrets in code** — Never commit secrets to version control
3. **AWS Secrets Manager only** — All secrets live in AWS Secrets Manager
4. **No long-lived credentials** — Use SSO and OIDC, not static access keys

---

## Local Development

Authenticate via AWS SSO:

```bash
aws sso login --profile palindrom
```

Then access secrets via the AWS SDK:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'eu-west-2' });
const secret = await client.send(
  new GetSecretValueCommand({ SecretId: 'my-service/production' })
);
```

The base packages (`@palindrom/fastify-base`, `palindrom-ai/llm`) handle secret loading automatically.

---

## GitHub Actions

Connect via OIDC — no AWS access keys stored in GitHub:

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::ACCOUNT_ID:role/github-actions
          aws-region: eu-west-2
```

The OIDC role has permission to read secrets from AWS Secrets Manager.

---

## Secret Naming Convention

```
{service}/{environment}
```

Examples:
- `api/production`
- `api/staging`
- `llm-service/production`

---

## What NOT to Do

| Don't | Do Instead |
|-------|------------|
| Create `.env` files | Use AWS SSO + Secrets Manager |
| Store AWS access keys | Use SSO locally, OIDC in CI |
| Commit secrets to git | Store in Secrets Manager |
| Share secrets via Slack | Grant SSO access to the secret |
| Use `.env.example` with real values | Use `.env.example` with placeholder descriptions only |

---

## `.env.example`

Projects may include `.env.example` for documentation only — describing what secrets are needed, not their values:

```bash
# .env.example
# All secrets are loaded from AWS Secrets Manager
# Authenticate with: aws sso login --profile palindrom

# AWS_REGION - defaults to eu-west-2
# SECRET_ID - the Secrets Manager secret to load (e.g., api/production)
```

---

## Why This Exists

- **Security** — No secrets on developer machines or in repos
- **Rotation** — Secrets can be rotated without redeploying
- **Audit** — AWS CloudTrail logs all secret access
- **Consistency** — Same access pattern everywhere
