---
id: data-engineering
title: Data Engineering
category: data
priority: 3
tags: [python, pyspark, data, etl]
---

## Data Engineering

### Requirements

- All transformations in Python (PySpark)
- Alert failures to SigNoz via `palindrom-ai/monitoring`

### Stack

| Area | Choice |
|------|--------|
| Language | Python (PySpark) |
| Architecture | Medallion (bronze/silver/gold) |
| Storage | Parquet in S3 |
| Schema registry | Apicurio |
| Testing | pytest |

### Medallion Architecture

| Layer | Purpose |
|-------|---------|
| Bronze | Raw data, as-is from source |
| Silver | Cleaned, validated, deduplicated |
| Gold | Business-ready, aggregations, features |

### What NOT to Do

- Write SQL-only notebooks
- Use dbt
- Deploy manually
- Skip testing

### S3 Bucket Standard

#### Bucket Structure

All projects must use separate buckets by purpose, not prefixes within a single bucket.

| Bucket Suffix | Versioning | Lifecycle | Purpose |
|---------------|------------|-----------|---------|
| `-raw-landing` | ON | 90 days | Incoming data uploads |
| `-warehouse` | ON | 30 days | Iceberg/Delta tables |
| `-temp` | OFF | 7 days | Intermediate processing |
| `-artifacts` | ON | None | Models, configs, outputs |
| `-logs` | OFF | 90 days | Application logs |

#### Naming Convention

```
{project}-{purpose}-{env}
```

Example: `analytics-warehouse-prod`, `ml-raw-landing-dev`

#### Required Configuration

**All buckets:**
- Block public access: enabled
- Encryption: SSE-S3 (minimum) or SSE-KMS
- Access logging: enabled, sent to `-logs` bucket

**Versioned buckets:**
- Lifecycle rule to expire non-current versions per table above
- Lifecycle rule to abort incomplete multipart uploads after 7 days

**Temp buckets:**
- Lifecycle rule to delete all objects after 7 days

#### Rationale

Separate buckets enable:
- Per-bucket versioning and lifecycle policies
- Simpler IAM policies (bucket-level grants)
- Independent cost tracking
- Blast radius containment

#### What Not To Do

- ❌ Single bucket with `/raw/`, `/warehouse/`, `/temp/` prefixes
- ❌ Versioning on temp/staging data (wasted cost)
- ❌ No lifecycle rules on versioned buckets (unbounded growth)
- ❌ Public access on any bucket

#### Enforcement

New buckets require review. Non-compliant buckets flagged in monthly audit.
