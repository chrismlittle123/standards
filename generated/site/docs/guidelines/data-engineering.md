
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
