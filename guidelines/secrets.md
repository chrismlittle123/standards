---
id: secrets
title: Secrets Management
category: security
priority: 1
tags: [typescript, python, secrets, security, cloud]
---

## Secrets Management

All secrets must be stored in the cloud platform's secrets manager. No local `.env` files.

### Supported Secrets Managers

Use the secrets manager corresponding to your project's cloud platform:

- **AWS**: AWS Secrets Manager
- **GCP**: Google Cloud Secret Manager
- **Azure**: Azure Key Vault

### Requirements

- No `.env` files — never store secrets locally
- All secrets in the platform's secrets manager
- Local dev authenticates via platform CLI (AWS SSO, `gcloud auth`, `az login`)
- CI/CD authenticates via OIDC (no static keys)

### Local Development

Authenticate using your platform's CLI:

```bash
# AWS
aws sso login --profile palindrom

# GCP
gcloud auth application-default login

# Azure
az login
```

Secrets are loaded automatically by the base packages.

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

- Create `.env` files
- Store cloud credentials/access keys in GitHub
- Commit secrets to git
- Share secrets via Slack
