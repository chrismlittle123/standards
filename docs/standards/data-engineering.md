# Data Engineering

**Status:** Standard
**Platform:** Databricks

---

## Overview

All data engineering runs on **Databricks** using **Python (PySpark)**. No SQL-only transformations, no dbt.

---

## Stack

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
| Alerting | Better Stack (via `@palindrom/logging`) |

---

## Medallion Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                              S3                                  │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     Bronze      │     Silver      │            Gold             │
│   (raw data)    │   (cleaned)     │    (business-ready)         │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Raw events    │ • Deduplicated  │ • Aggregations              │
│ • Raw files     │ • Validated     │ • Features for LLM training │
│ • As-is from    │ • Typed schemas │ • Enriched datasets         │
│   source        │ • Normalized    │ • Ready for consumption     │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Layer Rules

| Layer | Purpose | Schema | Quality |
|-------|---------|--------|---------|
| Bronze | Land raw data exactly as received | Schema-on-read | None |
| Silver | Clean, validate, deduplicate | Enforced schema | Validated |
| Gold | Business logic, aggregations, features | Enforced schema | Tested |

---

## Storage

**Parquet in S3** for all data:

```
s3://palindrom-data-{env}/
├── bronze/
│   ├── events/
│   ├── audio/
│   ├── video/
│   └── images/
├── silver/
│   ├── events/
│   └── media_metadata/
└── gold/
    ├── aggregations/
    └── training_datasets/
```

Use Delta Lake format when you need:
- ACID transactions
- Time travel
- Merge/upsert operations

---

## Schema Registry

**Apicurio** for event schema management:

- All events must have a registered schema
- Schema evolution must be backward compatible
- Producers register schemas, consumers validate against them

---

## Processing

### Python Only

All transformations in Python. Use Spark SQL only when it's cleaner for simple queries:

```python
# PySpark DataFrame API (preferred for complex logic)
df = (
    spark.read.parquet("s3://palindrom-data/bronze/events/")
    .filter(col("event_type") == "user_action")
    .withColumn("processed_at", current_timestamp())
)

# Spark SQL (fine for simple queries)
df = spark.sql("""
    SELECT user_id, COUNT(*) as event_count
    FROM events
    GROUP BY user_id
""")
```

### Unstructured Data Processing

For audio, video, images, and NLP:

```python
from palindrom.data import AudioProcessor, VideoProcessor, ImageProcessor

# Process audio files
processor = AudioProcessor()
df = processor.extract_features(
    spark.read.parquet("s3://palindrom-data/bronze/audio/")
)

# Process images
processor = ImageProcessor()
df = processor.extract_embeddings(
    spark.read.parquet("s3://palindrom-data/bronze/images/")
)
```

Reusable processing logic lives in shared packages.

---

## Code Structure

```
data-pipelines/
├── src/
│   └── pipelines/
│       ├── __init__.py
│       ├── bronze/           # Ingestion jobs
│       │   ├── ingest_events.py
│       │   └── ingest_media.py
│       ├── silver/           # Cleaning jobs
│       │   ├── clean_events.py
│       │   └── process_media.py
│       └── gold/             # Business logic
│           ├── aggregate_events.py
│           └── build_training_data.py
├── tests/
│   ├── unit/
│   │   └── test_transformations.py
│   ├── integration/
│   │   └── test_pipelines.py
│   └── data_quality/
│       └── test_gold_tables.py
├── databricks.yml            # Asset Bundles config
├── pyproject.toml
└── pytest.ini
```

---

## Orchestration

**Databricks Workflows** for all job scheduling:

```yaml
# databricks.yml (Asset Bundles)
bundle:
  name: data-pipelines

resources:
  jobs:
    daily_ingestion:
      name: "Daily Ingestion"
      schedule:
        quartz_cron_expression: "0 0 6 * * ?"
        timezone_id: "UTC"
      tasks:
        - task_key: ingest_events
          python_wheel_task:
            package_name: pipelines
            entry_point: ingest_events
        - task_key: clean_events
          depends_on:
            - task_key: ingest_events
          python_wheel_task:
            package_name: pipelines
            entry_point: clean_events
```

---

## Deployment

**Databricks Asset Bundles** for all deployments:

```bash
# Deploy to development
databricks bundle deploy -t dev

# Deploy to production
databricks bundle deploy -t prod
```

Deployment runs via GitHub Actions (see CI/CD standard).

---

## Testing

**Custom pytest** for all testing:

### Unit Tests (transformations)

```python
# tests/unit/test_transformations.py
import pytest
from pipelines.silver.clean_events import deduplicate_events

def test_deduplicate_events(spark_session):
    input_df = spark_session.createDataFrame([
        {"id": 1, "value": "a"},
        {"id": 1, "value": "a"},  # duplicate
        {"id": 2, "value": "b"},
    ])

    result = deduplicate_events(input_df)

    assert result.count() == 2
```

### Data Quality Tests

```python
# tests/data_quality/test_gold_tables.py
import pytest

def test_no_null_user_ids(spark_session):
    df = spark_session.read.parquet("s3://palindrom-data/gold/aggregations/")
    null_count = df.filter(col("user_id").isNull()).count()
    assert null_count == 0, f"Found {null_count} null user_ids"

def test_event_counts_positive(spark_session):
    df = spark_session.read.parquet("s3://palindrom-data/gold/aggregations/")
    invalid = df.filter(col("event_count") <= 0).count()
    assert invalid == 0, "Event counts must be positive"
```

---

## Alerting

Job failures go to **Better Stack** via the observability standard:

```python
from palindrom.logging import logger, capture_error

try:
    run_pipeline()
except Exception as e:
    capture_error(e, context={"job": "daily_ingestion", "layer": "bronze"})
    raise
```

Configure Databricks Workflows to send failure notifications:

```yaml
# databricks.yml
resources:
  jobs:
    daily_ingestion:
      email_notifications:
        on_failure:
          - alerts@palindrom.ai
      webhook_notifications:
        on_failure:
          - id: better_stack_webhook
```

---

## Environments

| Environment | S3 Bucket | Databricks Workspace |
|-------------|-----------|---------------------|
| development | `palindrom-data-dev` | dev workspace |
| staging | `palindrom-data-staging` | staging workspace |
| production | `palindrom-data-prod` | prod workspace |

---

## What NOT to Do

| Don't | Do Instead |
|-------|------------|
| Write SQL-only notebooks | Use Python with Spark SQL where needed |
| Use dbt | Use Python packages |
| Store data in workspace storage | Store in S3 |
| Schedule with cron on a VM | Use Databricks Workflows |
| Deploy manually | Use Asset Bundles via CI/CD |
| Skip testing | Write pytest tests for all pipelines |
