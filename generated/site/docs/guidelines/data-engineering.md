
## Data Engineering

Use `palindrom-ai/databricks-utils` for all data engineering on Databricks.

### Requirements

- Use `palindrom-ai/databricks-utils` for shared utilities
- All transformations in Python (PySpark)
- Deploy with Databricks Asset Bundles
- Alert failures to Better Stack via `@palindrom/logging`

### Installation

```bash
pip install palindrom-databricks-utils
```

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

### Deployment

```bash
databricks bundle deploy -t dev
databricks bundle deploy -t prod
```

### What NOT to Do

- Write SQL-only notebooks
- Use dbt
- Store data in workspace storage
- Deploy manually
- Skip testing

Refer to [palindrom-ai/databricks-utils](https://github.com/palindrom-ai/databricks-utils) for utilities.
