---
id: secrets
title: Secrets Management
category: security
priority: 2
tags: [security, infrastructure, gcp, aws, secrets, deployment]
author: Engineering Team
lastUpdated: "2024-03-15"
summary: "Standards for creating, storing, and accessing secrets across all environments"
---

## Secrets Management

All secrets must be stored in the cloud platform's secrets manager. No local `.env` files.

### Creating Secrets

Always create secrets using the `palindrom-ai/infra` package. Never use `gcloud`, `aws`, or `az` CLI commands to create or delete secret resources.

```typescript
import { Secret } from 'palindrom-ai/infra';

const apiKey = new Secret("StripeApiKey");
```

The package creates the secret resource in the platform's secrets manager. After deployment, manually add the sensitive value through the cloud console or CLI:

```bash
# After Pulumi creates the secret resource, set the value:
# AWS
aws secretsmanager put-secret-value --secret-id StripeApiKey --secret-string "sk_live_..."

# GCP
echo -n "sk_live_..." | gcloud secrets versions add StripeApiKey --data-file=-
```

This ensures all secret resources are tracked in infrastructure-as-code, reviewed in PRs, and managed consistently across environments — while keeping sensitive values out of code and version control.

### Supported Secrets Managers

Use the secrets manager corresponding to your project's cloud platform:

- **AWS**: AWS Secrets Manager
- **GCP**: Google Cloud Secret Manager
- **Azure**: Azure Key Vault

### Requirements

- No `.env` files — never store secrets locally
- All secrets in the platform's secrets manager
- All secret creation/deletion goes through `palindrom-ai/infra`
- Local dev authenticates via platform CLI (AWS SSO, `gcloud auth`, `az login`)
- CI/CD authenticates via OIDC (no static keys)

### Local Development

Authenticate using your platform's CLI to **load** secrets at runtime:

```bash
# AWS
aws sso login --profile palindrom

# GCP
gcloud auth application-default login

# Azure
az login
```

Secrets are loaded automatically by the base packages. CLI usage is only for authenticating your local session — never for creating or managing secrets directly.

### GitHub Actions

Prefer using `palindrom-ai/github-actions` reusable workflows which handle OIDC automatically. If writing custom workflows, use the appropriate pattern for your platform:

**AWS:**
```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::ACCOUNT_ID:role/github-actions
      aws-region: eu-west-2
```

**GCP:**
```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: google-github-actions/auth@v2
    with:
      workload_identity_provider: projects/PROJECT_ID/locations/global/workloadIdentityPools/POOL/providers/PROVIDER
      service_account: github-actions@PROJECT_ID.iam.gserviceaccount.com
```

**Azure:**
```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: azure/login@v2
    with:
      client-id: ${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.AZURE_TENANT_ID }}
      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### Secret Naming

```
{service}/{environment}
```

Examples: `api/production`, `llm-service/staging`

### What NOT to Do

- Create or delete secret resources via CLI (`gcloud secrets create`, `aws secretsmanager create-secret`, `gcloud secrets delete`, etc.)
- Create `.env` files
- Store cloud credentials/access keys in GitHub
- Put sensitive values in Pulumi code, config, or stack outputs
- Commit secrets to git
- Share secrets via Slack
- Write raw Pulumi secret resources instead of using `palindrom-ai/infra`
