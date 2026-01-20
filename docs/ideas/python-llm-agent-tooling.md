# Python Tooling for LLM Agent Development (2026)

A comprehensive reference of Python libraries and tools for building LLM-powered agents, organized by category.

---

## 1. Agent Frameworks

### LangChain
**What:** The most popular framework for building LLM-powered applications with modular components for chains, tools, memory, and RAG.

**How:** Provides abstractions like `Chain`, `Agent`, `Tool`, and `Memory` that you compose together. Handles prompt templates, output parsing, and tool orchestration.

```python
from langchain.agents import create_react_agent
from langchain_openai import ChatOpenAI

agent = create_react_agent(llm=ChatOpenAI(), tools=[...], prompt=prompt)
```

**Best for:** General-purpose LLM apps, RAG pipelines, teams wanting extensive integrations.

---

### LangGraph
**What:** Low-level orchestration framework for stateful, long-running agents with graph-based execution.

**How:** Tasks are represented as nodes in a directed acyclic graph (DAG). Each node has predetermined tools, and the LLM is only engaged for ambiguity or branching decisions.

```python
from langgraph.graph import StateGraph

graph = StateGraph(AgentState)
graph.add_node("research", research_node)
graph.add_node("write", write_node)
graph.add_edge("research", "write")
```

**Best for:** Complex multi-step workflows, human-in-the-loop, enterprise agent systems.

---

### CrewAI
**What:** Framework for orchestrating role-playing AI agents with 42K+ GitHub stars.

**How:** Define agents with roles, goals, and backstories. Assign tasks and let them collaborate. Built from scratch (no LangChain dependency).

```python
from crewai import Agent, Task, Crew

researcher = Agent(role="Researcher", goal="Find latest AI news", tools=[search])
writer = Agent(role="Writer", goal="Write engaging articles")
crew = Crew(agents=[researcher, writer], tasks=[...])
result = crew.kickoff()
```

**Best for:** Content creation, research workflows, customer service automation.

---

### AutoGen (Microsoft)
**What:** Open-source framework for multi-agent conversations and LLM workflows.

**How:** Agents communicate by passing messages in a loop. Supports cross-language (Python/.NET), local agents, and distributed networks.

```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent("assistant", llm_config={"model": "gpt-4"})
user = UserProxyAgent("user", code_execution_config={"work_dir": "coding"})
user.initiate_chat(assistant, message="Write a Python script...")
```

**Best for:** Conversational agents, code generation, multi-agent collaboration.

---

### smolagents (Hugging Face)
**What:** Lightweight agent framework (~1,000 lines) with first-class support for code agents.

**How:** LLM writes actions as Python code snippets rather than JSON. Iterative reasoning loops: observe → decide → act.

```python
from smolagents import CodeAgent, HfApiModel

agent = CodeAgent(tools=[search_tool], model=HfApiModel())
result = agent.run("Find the population of Paris")
```

**Best for:** Developers wanting transparency, code-first agents, learning agentic patterns.

---

### PydanticAI
**What:** Agent framework from the Pydantic team — "FastAPI feeling for GenAI."

**How:** Type-safe agents with Pydantic validation. Tools defined via decorators, automatic retry on validation failures.

```python
from pydantic_ai import Agent

agent = Agent('anthropic:claude-sonnet-4-0', instructions='Be concise.')

@agent.tool
def get_weather(city: str) -> str:
    """Get weather for a city"""
    return f"Weather in {city}: 72°F"

result = agent.run_sync("What's the weather in NYC?")
```

**Best for:** Type-safe outputs, production apps, teams already using Pydantic.

---

### Langroid
**What:** Multi-agent framework from CMU/UW-Madison researchers using Actor-based paradigm.

**How:** Agents with optional LLM, vector-store, and tools collaborate by exchanging messages.

```python
from langroid import ChatAgent, ChatAgentConfig

agent = ChatAgent(ChatAgentConfig(llm=OpenAIGPTConfig(chat_model="gpt-4")))
response = agent.llm_response("Hello!")
```

**Best for:** Research-oriented projects, multi-agent systems, knowledge graph integration.

---

### Haystack
**What:** Open-source framework for production-ready RAG, search, and agent workflows.

**How:** Modular pipeline architecture. Connect components like retrievers, readers, generators.

```python
from haystack import Pipeline
from haystack.components.generators import OpenAIGenerator

pipeline = Pipeline()
pipeline.add_component("llm", OpenAIGenerator())
result = pipeline.run({"llm": {"prompt": "Explain quantum computing"}})
```

**Best for:** Production RAG, semantic search, document QA.

---

### OpenAI Agents SDK
**What:** Lightweight framework for multi-agent workflows from OpenAI.

**How:** Agents with tools, instructions, guardrails. Supports handoffs between specialized agents.

```python
from agents import Agent, Runner

agent = Agent(name="Assistant", instructions="Help users", tools=[...])
result = Runner.run_sync(agent, "What's 2+2?")
```

**Best for:** OpenAI-centric workflows, simple agent setups.

---

## 2. Structured Output & Validation

### Instructor
**What:** Most popular library for extracting structured data from LLMs (3M+ monthly downloads).

**How:** Define Pydantic model → get validated, typed data. Automatic retries on validation failure.

```python
import instructor
from pydantic import BaseModel
from openai import OpenAI

class User(BaseModel):
    name: str
    age: int

client = instructor.from_openai(OpenAI())
user = client.chat.completions.create(
    model="gpt-4",
    response_model=User,
    messages=[{"role": "user", "content": "John is 30 years old"}]
)
# User(name='John', age=30)
```

**Best for:** Data extraction, API responses, any app needing reliable structured output.

---

### Guardrails AI
**What:** Framework for adding safety validation to LLM inputs/outputs.

**How:** Chain validators that check for toxicity, PII, hallucination, format errors.

```python
from guardrails import Guard
from guardrails.hub import ToxicLanguage, DetectPII

guard = Guard().use_many(
    ToxicLanguage(on_fail="exception"),
    DetectPII(on_fail="fix")
)
result = guard.validate("Check this text for issues")
```

**Best for:** Customer-facing chatbots, regulated industries, safety-critical apps.

---

### Outlines
**What:** Structured text generation with guaranteed valid outputs.

**How:** Compiles regex/JSON schemas into finite state machines that constrain token generation.

```python
import outlines

model = outlines.models.transformers("mistralai/Mistral-7B-v0.1")
generator = outlines.generate.json(model, schema)
result = generator("Generate a person's details")
```

**Best for:** Local models, guaranteed JSON output, regex-constrained generation.

---

## 3. Vector Databases & Embeddings

### ChromaDB
**What:** Python-first, embedded vector database for prototyping.

**How:** In-memory or persistent storage with built-in embedding functions.

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("docs")
collection.add(documents=["doc1", "doc2"], ids=["1", "2"])
results = collection.query(query_texts=["search query"], n_results=2)
```

**Best for:** Prototyping, MVPs, < 10M vectors.

---

### Qdrant
**What:** Open-source Rust vector database with rich filtering.

**How:** High-performance similarity search with JSON payload filtering.

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)
client.upsert(collection_name="docs", points=[...])
results = client.search(collection_name="docs", query_vector=[...], limit=5)
```

**Best for:** Production RAG, real-time search, complex filtering.

---

### Pinecone
**What:** Fully-managed serverless vector database.

**How:** Cloud-native, handles scaling automatically.

```python
from pinecone import Pinecone

pc = Pinecone(api_key="...")
index = pc.Index("my-index")
index.upsert(vectors=[{"id": "1", "values": [...]}])
results = index.query(vector=[...], top_k=5)
```

**Best for:** Enterprise, zero-ops, high-scale production.

---

### Milvus / Zilliz
**What:** Open-source, GPU-accelerated vector database for massive scale.

**How:** Distributed architecture supporting billions of vectors.

```python
from pymilvus import connections, Collection

connections.connect("default", host="localhost", port="19530")
collection = Collection("docs")
results = collection.search(data=[[...]], limit=10)
```

**Best for:** Large-scale deployments, GPU acceleration, enterprise.

---

### pgvector
**What:** PostgreSQL extension for vector similarity search.

**How:** Store vectors alongside relational data in Postgres.

```python
# Using SQLAlchemy
from pgvector.sqlalchemy import Vector

class Document(Base):
    embedding = Column(Vector(1536))
```

**Best for:** Teams already using Postgres, hybrid queries.

---

### LanceDB
**What:** Embedded vector database built on Lance columnar format.

**How:** Serverless, works directly with files.

```python
import lancedb

db = lancedb.connect("./lancedb")
table = db.create_table("docs", data=[{"vector": [...], "text": "..."}])
results = table.search([...]).limit(5).to_list()
```

**Best for:** Embedded apps, serverless, cost-sensitive deployments.

---

## 4. Embedding Models

### sentence-transformers
**What:** State-of-the-art sentence embeddings library.

**How:** Load pre-trained models, encode text to dense vectors.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(["Hello world", "How are you?"])
```

**Best for:** Local embeddings, custom domains, cost control.

---

### OpenAI Embeddings
**What:** Cloud API for text embeddings.

**How:** Simple API call, no GPU needed.

```python
from openai import OpenAI

client = OpenAI()
response = client.embeddings.create(model="text-embedding-3-small", input="Hello")
embedding = response.data[0].embedding
```

**Best for:** Quick setup, high quality, pay-per-use.

---

### FlagEmbedding (BGE)
**What:** Open-source embedding models from BAAI.

**How:** State-of-the-art retrieval performance.

```python
from FlagEmbedding import FlagModel

model = FlagModel('BAAI/bge-base-en-v1.5')
embeddings = model.encode(["query", "document"])
```

**Best for:** High-quality retrieval, open-source alternative.

---

## 5. Document Processing & Chunking

### Unstructured
**What:** ETL toolkit for parsing any document type.

**How:** Auto-detects file type, extracts text with layout awareness.

```python
from unstructured.partition.auto import partition

elements = partition("document.pdf")
for element in elements:
    print(element.text)
```

**Best for:** PDFs, images, HTML, Office docs — any format.

---

### LangChain Text Splitters
**What:** Collection of chunking strategies.

**How:** Character-based, recursive, semantic, markdown-aware splitting.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = splitter.split_text(long_document)
```

**Best for:** RAG pipelines, flexible chunking strategies.

---

### LlamaIndex Node Parsers
**What:** Document chunking with metadata preservation.

**How:** Breaks documents into nodes that inherit parent attributes.

```python
from llama_index.core.node_parser import SentenceSplitter

parser = SentenceSplitter(chunk_size=512)
nodes = parser.get_nodes_from_documents(documents)
```

**Best for:** LlamaIndex pipelines, hierarchical documents.

---

### PyMuPDF (fitz)
**What:** Fast PDF parsing library.

**How:** Extract text, images, tables from PDFs.

```python
import fitz

doc = fitz.open("document.pdf")
for page in doc:
    text = page.get_text()
```

**Best for:** PDF-heavy workloads, performance-critical parsing.

---

## 6. LLM Inference Engines

### vLLM
**What:** High-throughput inference engine with PagedAttention.

**How:** Continuous batching, automatic memory management.

```bash
vllm serve meta-llama/Llama-3.1-8B-Instruct
```

```python
from vllm import LLM

llm = LLM(model="meta-llama/Llama-3.1-8B-Instruct")
outputs = llm.generate(["Hello, my name is"])
```

**Best for:** Production GPU serving, high throughput.

---

### SGLang
**What:** High-performance serving with RadixAttention for prefix caching.

**How:** Reuses KV cache for shared prompt prefixes.

```bash
python -m sglang.launch_server --model meta-llama/Llama-3.1-8B-Instruct
```

**Best for:** Multi-turn chat, agents with repeated prefixes, tool chains.

---

### Ollama
**What:** Easy local LLM runner with great developer experience.

**How:** Download and run models with simple CLI.

```bash
ollama run llama3.1
```

```python
import ollama

response = ollama.chat(model='llama3.1', messages=[{'role': 'user', 'content': 'Hello!'}])
```

**Best for:** Local development, prototyping, internal tools.

---

### llama.cpp (llama-cpp-python)
**What:** CPU-optimized inference in pure C++.

**How:** Runs on any hardware, GGUF format models.

```python
from llama_cpp import Llama

llm = Llama(model_path="./model.gguf")
output = llm("Hello, my name is", max_tokens=32)
```

**Best for:** CPU inference, edge devices, maximum portability.

---

### TGI (Text Generation Inference)
**What:** Hugging Face's production inference server.

**How:** Optimized for HF ecosystem, multi-backend support.

```bash
docker run ghcr.io/huggingface/text-generation-inference --model-id meta-llama/Llama-3.1-8B
```

**Best for:** Hugging Face users, long conversation prefix caching.

---

### LMDeploy
**What:** Performance-oriented inference with TurboMind backend.

**How:** Pure C++ engine, optimized for quantized models.

```python
from lmdeploy import pipeline

pipe = pipeline("meta-llama/Llama-3.1-8B-Instruct")
response = pipe(["Hello!"])
```

**Best for:** Maximum throughput, 4-bit Llama models.

---

## 7. Observability & Monitoring

### Langfuse
**What:** Open-source LLM observability platform (most popular).

**How:** Trace requests, track costs, manage prompts. Self-hostable.

```python
from langfuse import observe
from langfuse.openai import openai

@observe()
def my_llm_call():
    return openai.chat.completions.create(...)
```

**Best for:** Production monitoring, cost tracking, self-hosting.

---

### Arize Phoenix
**What:** OpenTelemetry-native LLM observability.

**How:** Accepts OTLP traces, auto-instruments popular frameworks.

```python
import phoenix as px
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor

px.launch_app()
tracer_provider = register(project_name="my-app")
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
```

**Best for:** OpenTelemetry users, RAG debugging, embedding visualization.

---

### LangSmith
**What:** LangChain's observability and evaluation platform.

**How:** Deep integration with LangChain ecosystem.

```python
from langsmith import Client, trace

client = Client(api_key="...")

@trace(client)
def my_chain():
    pass
```

**Best for:** LangChain users, prompt testing, evaluations.

---

### Opik
**What:** Fast LLM observability (7-14x faster than alternatives in benchmarks).

**How:** Comprehensive tracing with automated optimization.

```python
from opik import track

@track
def llm_call(prompt):
    return openai.chat.completions.create(...)
```

**Best for:** Performance-critical tracing, automated optimization.

---

### OpenLLMetry (Traceloop)
**What:** OpenTelemetry SDK for LLM applications.

**How:** Export traces to any OTLP-compatible backend.

```python
from traceloop.sdk import Traceloop

Traceloop.init(app_name="my_app")
```

**Best for:** OpenTelemetry standardization, multi-backend support.

---

## 8. Evaluation & Testing

### DeepEval
**What:** Pytest for LLMs — unit test LLM outputs.

**How:** 50+ built-in metrics, CI/CD integration.

```python
from deepeval import assert_test
from deepeval.metrics import HallucinationMetric
from deepeval.test_case import LLMTestCase

def test_no_hallucination():
    metric = HallucinationMetric(threshold=0.5)
    test_case = LLMTestCase(
        input="What's the refund policy?",
        actual_output="30-day refund available.",
        context=["All customers eligible for 30-day refund."]
    )
    assert_test(test_case, [metric])
```

**Best for:** CI/CD testing, RAG evaluation, pytest users.

---

### Braintrust
**What:** Managed evaluation platform with CI/CD integration.

**How:** GitHub Action posts eval results on PRs.

```typescript
await Eval("Customer Support Bot", {
  data: () => [{ input: "...", expected: "..." }],
  task: async (input) => await chatbot.respond(input),
  scores: [Factuality],
});
```

**Best for:** Teams wanting PR quality gates, production trace → test case workflow.

---

### RAGAS
**What:** Evaluation framework specifically for RAG pipelines.

**How:** Metrics for retrieval quality, faithfulness, relevance.

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy

result = evaluate(dataset, metrics=[faithfulness, answer_relevancy])
```

**Best for:** RAG-specific evaluation, retrieval quality metrics.

---

### TruLens
**What:** Semantic evaluation toolkit from Hugging Face.

**How:** Evaluate coherence, relevance, groundedness.

```python
from trulens_eval import Tru

tru = Tru()
results = tru.run(prompts, metric="coherence")
```

**Best for:** Semantic evaluation, feedback collection.

---

## 9. Fine-Tuning

### PEFT (Parameter-Efficient Fine-Tuning)
**What:** Hugging Face library for LoRA, QLoRA, and other efficient methods.

**How:** Train <1% of parameters, save 90%+ memory.

```python
from peft import LoraConfig, get_peft_model

config = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj", "v_proj"])
model = get_peft_model(base_model, config)
model.print_trainable_parameters()  # ~0.5% of total
```

**Best for:** Memory-efficient fine-tuning, consumer GPUs.

---

### Unsloth
**What:** 2x faster fine-tuning with 70% less memory.

**How:** Hand-optimized Triton kernels, QLoRA support.

```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    "unsloth/Llama-3.2-3B-Instruct",
    load_in_4bit=True
)
model = FastLanguageModel.get_peft_model(model, r=16, target_modules=[...])
```

**Best for:** Training on limited hardware, maximum efficiency.

---

### TRL (Transformer Reinforcement Learning)
**What:** Hugging Face library for SFT, RLHF, DPO.

**How:** SFTTrainer with native PEFT integration.

```python
from trl import SFTTrainer

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
)
trainer.train()
```

**Best for:** Supervised fine-tuning, RLHF, preference optimization.

---

### Axolotl
**What:** Config-driven fine-tuning framework.

**How:** YAML configuration, supports many methods.

```yaml
base_model: meta-llama/Llama-3.1-8B
adapter: qlora
dataset:
  - path: dataset.json
```

**Best for:** Quick experiments, YAML-based workflows.

---

### LLaMA-Factory
**What:** Unified fine-tuning framework with web UI.

**How:** Supports 100+ LLMs, multiple methods.

```bash
llamafactory-cli train config.yaml
```

**Best for:** Wide model support, web-based training UI.

---

## 10. MCP (Model Context Protocol)

### MCP Python SDK
**What:** Official SDK for building MCP servers and clients.

**How:** Standardized way to expose tools, resources, prompts to LLMs.

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("My Server")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

mcp.run()
```

**Best for:** Tool integration, standardized LLM interfaces.

---

### FastMCP
**What:** High-level Pythonic MCP framework (2.0).

**How:** Decorators for tools, resources, prompts. Production-ready.

```python
from fastmcp import FastMCP, Context

mcp = FastMCP("Demo")

@mcp.tool
async def search(query: str, ctx: Context) -> str:
    await ctx.info(f"Searching for {query}")
    return f"Results for {query}"
```

**Best for:** Production MCP servers, enterprise auth.

---

### langchain-mcp-adapters
**What:** LangChain integration for MCP servers.

**How:** Use MCP tools in LangChain agents.

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "math": {"transport": "stdio", "command": "python", "args": ["server.py"]}
})
tools = await client.get_tools()
```

**Best for:** LangChain users wanting MCP tools.

---

## 11. LLM APIs & Providers

### OpenAI SDK
**What:** Official Python client for OpenAI APIs.

```python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

---

### Anthropic SDK
**What:** Official Python client for Claude models.

```python
from anthropic import Anthropic

client = Anthropic()
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

---

### LiteLLM
**What:** Unified interface for 100+ LLM providers.

**How:** Single API for OpenAI, Anthropic, Bedrock, Vertex, etc.

```python
from litellm import completion

response = completion(
    model="claude-sonnet-4-20250514",  # or "gpt-4", "bedrock/...", etc.
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Best for:** Multi-provider apps, provider abstraction.

---

### google-generativeai
**What:** Official SDK for Google Gemini.

```python
import google.generativeai as genai

genai.configure(api_key="...")
model = genai.GenerativeModel('gemini-2.0-flash')
response = model.generate_content("Hello!")
```

---

## 12. Prompt Management

### PromptLayer
**What:** Prompt versioning and analytics platform.

**How:** Track prompt changes, A/B test, analyze.

```python
import promptlayer

openai = promptlayer.openai
response = openai.chat.completions.create(...)
```

**Best for:** Prompt versioning, team collaboration.

---

### Langfuse Prompt Management
**What:** Version control prompts within Langfuse.

**How:** Centralized management, tagging, experimentation.

```python
from langfuse import Langfuse

langfuse = Langfuse()
prompt = langfuse.get_prompt("my-prompt")
compiled = prompt.compile(variable="value")
```

**Best for:** Teams already using Langfuse.

---

## 13. Browser & UI Automation

### Playwright
**What:** Cross-browser automation for web agents.

**How:** Control Chromium, Firefox, WebKit programmatically.

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com")
    content = page.content()
```

**Best for:** Web scraping agents, browser-based automation.

---

### Selenium
**What:** Classic browser automation framework.

```python
from selenium import webdriver

driver = webdriver.Chrome()
driver.get("https://example.com")
element = driver.find_element("id", "button")
element.click()
```

---

### Browser-Use
**What:** AI-native browser automation.

**How:** LLM controls browser via natural language.

```python
from browser_use import Agent

agent = Agent(task="Search for Python tutorials", llm=llm)
result = await agent.run()
```

**Best for:** Agentic browser tasks, web research.

---

## 14. Data & Dataset Tools

### Hugging Face Datasets
**What:** Library for loading and processing datasets.

```python
from datasets import load_dataset

dataset = load_dataset("squad")
```

---

### Pandas
**What:** Data manipulation and analysis.

```python
import pandas as pd

df = pd.read_csv("data.csv")
df["processed"] = df["text"].apply(process_func)
```

---

### Polars
**What:** Fast DataFrame library (Rust-based).

```python
import polars as pl

df = pl.read_csv("data.csv")
result = df.filter(pl.col("value") > 100)
```

**Best for:** Large datasets, performance-critical processing.

---

## Quick Reference Table

| Category | Recommended Tools |
|----------|-------------------|
| **Agent Framework** | LangChain (general), CrewAI (multi-agent), PydanticAI (type-safe) |
| **Structured Output** | Instructor (simple), Guardrails AI (safety) |
| **Vector Database** | ChromaDB (prototype), Qdrant (production), Pinecone (managed) |
| **Embeddings** | sentence-transformers (local), OpenAI (cloud) |
| **Document Processing** | Unstructured (any format), LangChain splitters |
| **Inference Engine** | vLLM (production), Ollama (local dev), SGLang (agents) |
| **Observability** | Langfuse (open-source), Phoenix (OpenTelemetry) |
| **Evaluation** | DeepEval (pytest), RAGAS (RAG-specific) |
| **Fine-Tuning** | PEFT + TRL (standard), Unsloth (efficient) |
| **MCP** | FastMCP (servers), MCP Python SDK (official) |

---

## Getting Started Stack

For a new LLM agent project, start with:

```bash
pip install langchain openai chromadb instructor langfuse deepeval
```

1. **LangChain** — Agent orchestration
2. **OpenAI** — LLM provider
3. **ChromaDB** — Vector storage for RAG
4. **Instructor** — Structured outputs
5. **Langfuse** — Observability
6. **DeepEval** — Testing

Scale up by swapping:
- ChromaDB → Qdrant/Pinecone (production vectors)
- OpenAI → vLLM/SGLang (self-hosted inference)
- Add CrewAI for multi-agent workflows
- Add PEFT/Unsloth for fine-tuning
