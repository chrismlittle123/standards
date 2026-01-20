<!-- AUTO-GENERATED — DO NOT EDIT -->
<!-- Profile: Python Data Pipeline -->
<!-- Run "pnpm generate:profiles" to update -->

# Python Data Pipeline

Standards for data engineering pipelines on Databricks

---

You are working on a Python data pipeline running on Databricks.
Follow these guidelines strictly when writing or reviewing code.
Use PySpark for all transformations. Follow the medallion architecture.

---

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

---

## CI/CD & Deployment

All CI/CD runs on GitHub Actions. All deployments use SST (with Pulumi when SST doesn't support a resource).

### Requirements

- GitHub Actions for all CI/CD
- SST for infrastructure and deployment
- Pulumi within SST for unsupported resources
- OIDC authentication to AWS (no static keys)
- Trunk-based development (merge to main)

### Environments

| Environment | Trigger |
|-------------|---------|
| `development` | Auto on push to main |
| `staging` | Auto after dev passes |
| `production` | Manual approval |

### Deployment Flow

```
main → dev (auto) → staging (auto) → production (manual approval)
```

### Required Checks

All must pass before deploy:
- Lint
- Type check
- Tests
- Build
- Generated files up to date

### Rollback

- **Failed deploy:** SST auto-rollbacks
- **Bug in prod:** Revert commit or re-run previous successful deploy

### What NOT to Do

- Deploy from local machine
- Use long-lived AWS keys
- Skip checks
- Deploy directly to production

---

## Observability

All application observability must use the `@palindrom/logging` package (Better Stack).

### Requirements

- Use `@palindrom/logging` for all logging and error tracking — never integrate Better Stack directly
- Use structured JSON logging with consistent fields
- Include `requestId` in all log entries for correlation
- Never log secrets, passwords, or unmasked API keys

### Installation

```bash
pnpm add @palindrom/logging
```

### Required Log Fields

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp |
| `level` | debug, info, warn, error |
| `message` | Human-readable message |
| `requestId` | Correlation ID |
| `service` | Service name |
| `environment` | development, staging, production |

### Log Levels

| Level | Use For |
|-------|---------|
| `debug` | Development only |
| `info` | Normal operations |
| `warn` | Recoverable issues |
| `error` | Failures requiring attention |

Refer to [palindrom-ai/logging](https://github.com/palindrom-ai/logging) for implementation details.

---

## Data Engineering

All data engineering runs on Databricks using Python (PySpark).

### Stack

| Area | Choice |
|------|--------|
| Platform | Databricks |
| Language | Python (PySpark) |
| Architecture | Medallion (bronze/silver/gold) |
| Storage | Parquet in S3 |
| Schema registry | Apicurio |
| Orchestration | Databricks Workflows |
| Deployment | Databricks Asset Bundles |
| Testing | Custom pytest |

### Medallion Architecture

| Layer | Purpose |
|-------|---------|
| Bronze | Raw data, as-is from source |
| Silver | Cleaned, validated, deduplicated |
| Gold | Business-ready, aggregations, features |

### Requirements

- All transformations in Python (no SQL-only notebooks)
- Store all data in S3 as Parquet
- Deploy with Databricks Asset Bundles
- Test pipelines with pytest
- Alert failures to Better Stack

### Deployment

```bash
databricks bundle deploy -t dev
databricks bundle deploy -t prod
```

### Testing

```python
def test_no_null_user_ids(spark_session):
    df = spark_session.read.parquet("s3://palindrom-data/gold/aggregations/")
    null_count = df.filter(col("user_id").isNull()).count()
    assert null_count == 0
```

### What NOT to Do

- Write SQL-only notebooks
- Use dbt
- Store data in workspace storage
- Deploy manually
- Skip testing

---

## Code Quality Rules

## Code

### Linting

#### Ruff

#### Lint

- **select**: `E`, `F`, `I`, `UP`, `B`, `S`, `C4`, `RUF`

### Types

#### Ty

- **enabled**: `true`

### Unused

#### Vulture

- **enabled**: `true`

### Security

#### Secrets

- **enabled**: `true`

#### Pipaudit

- **enabled**: `true`
