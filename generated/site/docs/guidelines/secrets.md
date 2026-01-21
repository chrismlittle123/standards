
## Secrets Management

All secrets must be stored in AWS Secrets Manager. No local `.env` files.

### Requirements

- No `.env` files — never store secrets locally
- All secrets in AWS Secrets Manager
- Local dev authenticates via AWS SSO
- CI/CD authenticates via OIDC (no static keys)

### Local Development

```bash
aws sso login --profile palindrom
```

Secrets are loaded automatically by the base packages.

### GitHub Actions

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

### Secret Naming

```
{service}/{environment}
```

Examples: `api/production`, `llm-service/staging`

### What NOT to Do

- Create `.env` files
- Store AWS access keys in GitHub
- Commit secrets to git
- Share secrets via Slack
