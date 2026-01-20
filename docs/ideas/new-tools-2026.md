
# 🧠 Modern Software & AI Stack – 2026

**For a team of 6 AI Engineers (Python · TypeScript · AWS)**

## Document goals

* Map the **most modern and trending tools in 2026**
* Cover **LLMOps, autonomous agents, data engineering, backend engineering**
* Enable **deep learning + production readiness**
* Provide an **AI-native systems perspective** (agents, orchestration, observability)

---

## 1. LLMOps & AgentOps (core of the 2026 stack)

### 1.1 LLM & Agent orchestration frameworks

| Tool              | Role                                        | Languages  | 2026 Maturity          | Typical use cases          |
| ----------------- | ------------------------------------------- | ---------- | ---------------------- | -------------------------- |
| LangGraph         | Stateful agent orchestration (DAGs, cycles) | Python, TS | Stable, widely adopted | Complex, non-linear agents |
| LangChain         | LLM chaining & tooling                      | Python, TS | Mature                 | Rapid prototyping, RAG     |
| LlamaIndex        | Indexing & advanced RAG                     | Python     | Mature                 | Search, knowledge agents   |
| CrewAI            | Collaborative agents                        | Python     | Strong adoption        | Role-based multi-agents    |
| AutoGen           | Conversational agents                       | Python     | Mature                 | Agent-to-agent systems     |
| DSPy              | Structured prompt programming               | Python     | Rapid growth           | Prompt optimization        |
| OpenAI Agents SDK | Production-grade agents                     | Python, TS | Stable                 | Robust agent systems       |

---

### 1.2 LLM observability & debugging

| Tool                   | Focus                          |
| ---------------------- | ------------------------------ |
| LangSmith              | Traces, evals, replay          |
| Helicone               | LLM proxy & metrics            |
| Arize Phoenix          | RAG debugging / hallucinations |
| Weights & Biases (LLM) | Experiments & evaluations      |
| PromptLayer            | Prompt versioning              |

---

### 1.3 LLM evaluation & security

| Tool          | Purpose                  |
| ------------- | ------------------------ |
| TruLens       | LLM evaluation           |
| Ragas         | RAG scoring              |
| Guardrails AI | Output validation        |
| Rebuff        | Prompt injection defense |
| Lakera        | LLM security             |

---

## 2. Autonomous agents & execution systems

### 2.1 “Software engineer” agents

| Tool         | Capability                |
| ------------ | ------------------------- |
| Devin        | End-to-end autonomous dev |
| SWE-Agent    | Bug fixing                |
| OpenHands    | Open-source dev agents    |
| Continue.dev | IDE-embedded agent        |
| Cursor       | AI-native IDE             |

---

### 2.2 Execution & automation agents

| Tool                | Role                       |
| ------------------- | -------------------------- |
| Temporal            | Long-running orchestration |
| Airflow (AI-native) | Agent pipelines            |
| Prefect             | Modern flows               |
| Dagster             | Data + agent orchestration |
| Zapier AI           | Low-code automation        |
| Gumloop             | AI workflows               |

---

## 3. Data Engineering (batch, streaming, AI-native)

### 3.1 Ingestion & pipelines

| Tool        | Type             |
| ----------- | ---------------- |
| Airbyte     | Modern ingestion |
| Fivetran    | Managed ETL      |
| Meltano     | Open-source ELT  |
| Kafka       | Streaming        |
| Redpanda    | Kafka-compatible |
| AWS Kinesis | AWS streaming    |

---

### 3.2 Transformation & analytics

| Tool   | Usage                       |
| ------ | --------------------------- |
| dbt    | SQL transformations         |
| DuckDB | Embedded analytics          |
| Spark  | Large-scale processing      |
| Flink  | Advanced streaming          |
| Polars | High-performance DataFrames |

---

### 3.3 Data quality, catalog & governance

| Tool               | Focus              |
| ------------------ | ------------------ |
| Great Expectations | Data quality       |
| Soda               | Data tests         |
| OpenMetadata       | Data catalog       |
| DataHub            | Lineage            |
| Monte Carlo        | Data observability |

---

## 4. Vector databases & search (RAG foundation)

| Tool       | Strengths             |
| ---------- | --------------------- |
| Pinecone   | Managed & scalable    |
| Weaviate   | Graph + vector        |
| Milvus     | Open-source           |
| Qdrant     | Lightweight & fast    |
| OpenSearch | AWS-native            |
| pgvector   | PostgreSQL simplicity |

---

## 5. Backend engineering (AI-native)

### 5.1 APIs & services

| Tool         | Language       |
| ------------ | -------------- |
| FastAPI      | Python         |
| Django Ninja | Python         |
| NestJS       | TypeScript     |
| tRPC         | TypeScript     |
| GraphQL      | Multi-language |

---

### 5.2 Async & performance

| Tool               | Usage                  |
| ------------------ | ---------------------- |
| Celery             | Task queues            |
| Ray                | Distributed compute    |
| Modal              | Serverless Python      |
| AWS Lambda         | Serverless             |
| AWS Step Functions | Workflow orchestration |

---

## 6. Infrastructure, cloud & deployment

### 6.1 AWS & AI

| AWS Service     | Role                   |
| --------------- | ---------------------- |
| Bedrock         | Foundation models      |
| SageMaker       | Training & inference   |
| EKS             | Kubernetes             |
| ECS             | Containers             |
| CDK / Terraform | Infrastructure as code |

---

### 6.2 Containers & orchestration

| Tool       |
| ---------- |
| Docker     |
| Kubernetes |
| Karpenter  |
| ArgoCD     |
| Helm       |

---

## 7. Security, compliance & secrets

| Tool    | Focus          |
| ------- | -------------- |
| AWS IAM | Permissions    |
| Vault   | Secrets        |
| Snyk    | Code security  |
| Trivy   | Image scanning |
| OPA     | Policy as code |

---

## 8. Productivity & knowledge management

| Tool       | Usage                |
| ---------- | -------------------- |
| Perplexity | Technical search     |
| NotebookLM | Document reasoning   |
| Notion AI  | Knowledge base       |
| Obsidian   | Technical notes      |
| Linear     | Engineering planning |

---

## 9. Key 2026 trends to master

* **Agent-native systems** (agents as computation units)
* **Stateful agents with memory**
* **Multi-vector / multi-modal RAG**
* **LLM observability first**
* **AI-driven DevOps**
* **Evaluation over prompt hacking**
* **Python + TypeScript as the dominant pair**

---

## 10. Example “learning + production” stack

**LLMOps**
LangGraph · LangSmith · LlamaIndex · Ragas

**Agents**
CrewAI · AutoGen · Temporal

**Data**
Airbyte · dbt · DuckDB · OpenMetadata

**Backend**
FastAPI · NestJS · Ray

**Cloud**
AWS Bedrock · EKS · Terraform

---

### Possible next steps

If you want, I can:

* build a **skill-level map (junior → senior → expert)**
* create a **6–12 month learning roadmap**
* compare **open-source vs managed stacks**
* design a **minimal vs elite stack**
* convert this into a **structured GitHub repository**

👉 Tell me what you want to dive into first.
