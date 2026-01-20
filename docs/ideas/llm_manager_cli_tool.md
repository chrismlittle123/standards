# LLM Manager: `@company/ai` + `prompt` CLI

## Overview

This document specifies our unified AI infrastructure, consisting of two components:

1. **`@company/ai`** — A TypeScript SDK that wraps LiteLLM, Langfuse, and Vercel AI SDK into a single, simple interface
2. **`prompt` CLI** — A command-line tool for managing, testing, and deploying prompts

Together, these provide a complete AI development experience where:
- Prompts are separate from application code
- Observability is automatic
- LLM routing and fallbacks are handled
- Everything is agent-friendly (structured CLI output)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         prompt CLI                                  │
│                                                                     │
│  prompt list | test | deploy | stats | browse                       │
│  (Agent-friendly: all commands output JSON when piped)              │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                              reads/writes
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Git Repo: prompts/                               │
│                                                                     │
│  YAML prompt definitions + test cases                               │
│  Version controlled (source of truth)                               │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                         prompt deploy --env=production
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Langfuse                                    │
│                                                                     │
│  Runtime prompt serving (cached) + Observability                    │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                           SDK fetches prompts
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       @company/ai SDK                               │
│                                                                     │
│  ai.run() | ai.stream() | ai.agent()                                │
│  (Wraps LiteLLM + Langfuse + Vercel AI SDK)                         │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                            LLM calls via
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LiteLLM Proxy                                 │
│                                                                     │
│  Routing | Fallbacks | Cost tracking | Rate limiting                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
                 OpenAI        Anthropic        Google
```

---

# Part 1: `@company/ai` SDK

## Installation

```bash
npm install @company/ai
```

## Quick Start

```typescript
import { createAI } from '@company/ai';

// Configure once
export const ai = createAI({
  prompts: {
    source: process.env.NODE_ENV === 'development' ? 'local' : 'langfuse',
    localPath: './prompts',
  },
  llm: {
    baseURL: process.env.LITELLM_URL,
    apiKey: process.env.LITELLM_KEY,
  },
  observability: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_URL,
  },
});

// Use everywhere
const result = await ai.run('hospital/diagnosis', {
  inputs: {
    patientId: '123',
    symptoms: ['fever', 'cough'],
  },
});

console.log(result.data.summary);  // Typed!
```

---

## API Reference

### `ai.run(promptName, options)`

Execute a prompt and return structured output.

```typescript
const result = await ai.run('hospital/diagnosis', {
  // Required: variables to inject into prompt template
  inputs: {
    patientId: '123',
    symptoms: ['fever', 'cough'],
    language: 'Spanish',
  },
  
  // Optional: metadata for observability
  metadata: {
    userId: 'user-456',
    sessionId: 'session-789',
    feature: 'diagnosis',
  },
  
  // Optional: override prompt defaults
  overrides: {
    model: 'claude-sonnet',
    temperature: 0.5,
    maxTokens: 1000,
  },
});

// Result shape
result.data        // Typed output based on prompt's output schema
result.promptName  // 'hospital/diagnosis'
result.version     // Prompt version used
result.traceId     // Langfuse trace ID
result.usage       // { promptTokens, completionTokens, totalTokens }
result.cost        // Cost in USD
result.latency     // Latency in ms
```

---

### `ai.stream(promptName, options)`

Execute a prompt with streaming response.

```typescript
// In a Next.js API route
export async function POST(req: Request) {
  const { patientId, symptoms } = await req.json();
  
  const stream = await ai.stream('hospital/diagnosis', {
    inputs: { patientId, symptoms },
  });
  
  return stream.toResponse();  // Standard Response for streaming
}
```

```typescript
// Manual stream handling
const stream = await ai.stream('hospital/diagnosis', {
  inputs: { patientId, symptoms },
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}

const final = await stream.finalResult();
console.log(final.data);  // Complete typed output
```

---

### `ai.agent(promptName, options)`

Execute a multi-step agent with tools.

```typescript
import { ai, tool } from '@company/ai';
import { z } from 'zod';

// Define tools
const searchRecords = tool({
  name: 'search_records',
  description: 'Search patient medical records',
  inputs: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(10),
  }),
  execute: async ({ query, limit }) => {
    const results = await db.records.search(query, limit);
    return JSON.stringify(results);
  },
});

const orderTest = tool({
  name: 'order_test',
  description: 'Order a medical test for a patient',
  inputs: z.object({
    patientId: z.string(),
    testType: z.enum(['blood', 'urine', 'xray', 'mri']),
    priority: z.enum(['routine', 'urgent']).default('routine'),
  }),
  execute: async ({ patientId, testType, priority }) => {
    const order = await labSystem.createOrder(patientId, testType, priority);
    return `Order ${order.id} created successfully`;
  },
});

// Run agent
const result = await ai.agent('hospital/assistant', {
  inputs: {
    userMessage: 'What were my last blood test results and should I get another one?',
    patientId: '123',
  },
  tools: [searchRecords, orderTest],
  maxSteps: 10,
  
  // Optional: hook into each step
  onStep: (step) => {
    console.log(`Step ${step.number}: ${step.type}`);
    if (step.type === 'tool_call') {
      console.log(`  Tool: ${step.toolName}(${JSON.stringify(step.toolArgs)})`);
    }
  },
});

// Result includes full conversation
result.data           // Final response
result.steps          // Array of all steps taken
result.toolCalls      // Array of tool calls made
result.totalTokens    // Total tokens across all steps
```

---

### `ai.prompts`

Access prompt management directly.

```typescript
// Get a prompt (for inspection or custom usage)
const prompt = await ai.prompts.get('hospital/diagnosis');

prompt.name           // 'hospital/diagnosis'
prompt.version        // 3
prompt.model          // 'gpt-4o'
prompt.template       // Raw template string
prompt.inputSchema    // Zod schema for inputs
prompt.outputSchema   // Zod schema for outputs

// Compile a prompt manually
const compiled = prompt.compile({
  patientId: '123',
  symptoms: ['fever', 'cough'],
});

compiled.system       // Compiled system prompt
compiled.user         // Compiled user prompt
compiled.model        // Model to use
compiled.temperature  // Temperature setting

// List all prompts
const prompts = await ai.prompts.list();
const productionPrompts = await ai.prompts.list({ tag: 'production' });
```

---

### `ai.llm`

Direct LLM access (escape hatch).

```typescript
// When you need to bypass the prompt system
const response = await ai.llm.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  temperature: 0.7,
});

response.content      // Response text
response.usage        // Token usage
response.cost         // Cost in USD
```

---

### `ai.observe`

Manual observability controls.

```typescript
// Create a custom trace for complex workflows
const trace = ai.observe.trace({
  name: 'complex-diagnosis-workflow',
  metadata: {
    userId: user.id,
    patientId: patient.id,
  },
});

// Create spans within the trace
const fetchSpan = trace.span({ name: 'fetch-patient-data' });
const patientData = await fetchPatientData(patient.id);
fetchSpan.end({ output: patientData });

// Run AI within the trace
const result = await ai.run('hospital/diagnosis', {
  inputs: { patientId: patient.id, ...patientData },
  trace,  // Attach to existing trace
});

// Add a score
trace.score({
  name: 'diagnosis-quality',
  value: 0.95,
  comment: 'High confidence diagnosis',
});

// End the trace
trace.end();
```

---

### `ai.stats(promptName, options)`

Get usage statistics from Langfuse.

```typescript
const stats = await ai.stats('hospital/diagnosis', { days: 7 });

stats.totalCalls      // 1,234
stats.successRate     // 0.982
stats.avgLatency      // 1230 (ms)
stats.totalCost       // 45.60 (USD)
stats.totalTokens     // 892,000
stats.byDay           // Array of daily stats
stats.byVersion       // Stats broken down by prompt version
stats.errors          // Recent errors
```

---

## Configuration

### Full Configuration Options

```typescript
import { createAI } from '@company/ai';

export const ai = createAI({
  // Prompt configuration
  prompts: {
    // 'local' = read from filesystem (development)
    // 'langfuse' = fetch from Langfuse (production)
    source: 'langfuse',
    
    // Path to local prompts (when source = 'local')
    localPath: './prompts',
    
    // Cache TTL in seconds (when source = 'langfuse')
    cacheTtl: 60,
  },
  
  // LLM configuration (talks to LiteLLM proxy)
  llm: {
    baseURL: 'https://litellm.yourcompany.com',
    apiKey: 'sk-your-litellm-key',
    
    // Defaults for all requests
    defaultModel: 'gpt-4o',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    
    // Timeouts and retries
    timeout: 30000,
    retries: 2,
  },
  
  // Observability configuration (Langfuse)
  observability: {
    publicKey: 'pk-lf-...',
    secretKey: 'sk-lf-...',
    baseUrl: 'https://langfuse.yourcompany.com',
    
    // Enable/disable
    enabled: true,
    
    // Default metadata added to all traces
    defaultMetadata: {
      environment: 'production',
      service: 'hospital-api',
    },
  },
});
```

### Environment-Based Configuration

```typescript
// lib/ai.ts
import { createAI } from '@company/ai';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export const ai = createAI({
  prompts: {
    source: isDev ? 'local' : 'langfuse',
    localPath: './prompts',
  },
  llm: {
    baseURL: process.env.LITELLM_URL!,
    apiKey: process.env.LITELLM_KEY!,
  },
  observability: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    secretKey: process.env.LANGFUSE_SECRET_KEY!,
    baseUrl: process.env.LANGFUSE_URL!,
    enabled: !isTest,  // Disable in tests
  },
});
```

---

## Testing

### Mock Client

```typescript
import { createTestAI } from '@company/ai/testing';

// Create a mock client
const ai = createTestAI({
  prompts: {
    'hospital/diagnosis': {
      mockResponse: {
        summary: 'Test diagnosis summary',
        concerns: ['Test concern'],
        nextSteps: ['Test next step'],
      },
    },
  },
});

// Use in tests
test('diagnosis returns expected shape', async () => {
  const result = await ai.run('hospital/diagnosis', {
    inputs: { patientId: '123', symptoms: ['fever'] },
  });
  
  expect(result.data.summary).toBe('Test diagnosis summary');
});
```

### Dynamic Mocking

```typescript
import { createTestAI, mockPrompt } from '@company/ai/testing';

const ai = createTestAI();

test('handles different symptoms', async () => {
  // Mock based on inputs
  mockPrompt(ai, 'hospital/diagnosis', (inputs) => {
    if (inputs.symptoms.includes('chest pain')) {
      return {
        summary: 'Urgent cardiac evaluation needed',
        concerns: ['Possible cardiac event'],
        nextSteps: ['ECG', 'Troponin levels'],
      };
    }
    return {
      summary: 'Routine evaluation',
      concerns: [],
      nextSteps: ['Monitor symptoms'],
    };
  });
  
  const urgentResult = await ai.run('hospital/diagnosis', {
    inputs: { patientId: '123', symptoms: ['chest pain'] },
  });
  
  expect(urgentResult.data.concerns).toContain('Possible cardiac event');
});
```

### Testing Tools

```typescript
import { createTestAI, mockTool } from '@company/ai/testing';

const ai = createTestAI();

test('agent uses tools correctly', async () => {
  const toolCalls: any[] = [];
  
  const searchRecords = mockTool({
    name: 'search_records',
    execute: async (args) => {
      toolCalls.push(args);
      return JSON.stringify([{ id: 1, result: 'Normal' }]);
    },
  });
  
  await ai.agent('hospital/assistant', {
    inputs: { userMessage: 'Find my records' },
    tools: [searchRecords],
  });
  
  expect(toolCalls.length).toBeGreaterThan(0);
});
```

---

## Internal Architecture

```
@company/ai/
├── src/
│   ├── index.ts                 # Public exports
│   ├── client.ts                # createAI() factory
│   ├── types.ts                 # All TypeScript types
│   │
│   ├── llm/                     # LLM layer (wraps LiteLLM)
│   │   ├── index.ts
│   │   ├── client.ts            # HTTP client to LiteLLM proxy
│   │   ├── models.ts            # Model aliases and defaults
│   │   └── errors.ts            # Standardized error types
│   │
│   ├── prompts/                 # Prompt layer
│   │   ├── index.ts
│   │   ├── loader.ts            # Load from local/Langfuse
│   │   ├── compiler.ts          # Handlebars compilation
│   │   ├── schema.ts            # YAML validation
│   │   └── cache.ts             # Prompt caching
│   │
│   ├── observability/           # Tracing layer (wraps Langfuse)
│   │   ├── index.ts
│   │   ├── tracer.ts            # Trace/span management
│   │   ├── auto-trace.ts        # Automatic tracing wrapper
│   │   └── stats.ts             # Stats queries
│   │
│   ├── agents/                  # Agent layer (wraps Vercel AI)
│   │   ├── index.ts
│   │   ├── runner.ts            # Agent execution loop
│   │   ├── tools.ts             # Tool definition helper
│   │   └── stream.ts            # Streaming utilities
│   │
│   └── testing/                 # Test utilities
│       ├── index.ts
│       ├── mock-client.ts
│       └── mock-tools.ts
│
├── package.json
└── tsconfig.json
```

---

# Part 2: `prompt` CLI

## Installation

```bash
npm install -g @company/prompt-cli
```

## Design Principles

### Agent-Friendly

All commands output JSON when piped or when `--json` flag is used:

```bash
# Human output (TTY)
$ prompt list
hospital/diagnosis    v3  production  gpt-4o
hospital/medication   v2  staging     gpt-4o

# Agent output (piped or --json)
$ prompt list --json
[
  {"name": "hospital/diagnosis", "version": 3, "env": "production", "model": "gpt-4o"},
  {"name": "hospital/medication", "version": 2, "env": "staging", "model": "gpt-4o"}
]
```

### Composable

Commands can be chained:

```bash
# Find failing prompts
prompt list --tag=production --json | \
  jq '.[].name' -r | \
  xargs -I {} prompt test {} --json | \
  jq 'select(.success == false)'
```

### Non-Interactive by Default

No prompts for confirmation (breaks agents):

```bash
# Bad (don't do this)
$ prompt deploy
Are you sure? [y/n]

# Good
$ prompt deploy --env=production --confirm
$ prompt deploy --env=production --dry-run
```

---

## Command Reference

### `prompt list`

List all prompts.

```bash
prompt list [options]

Options:
  --tag <tag>           Filter by tag
  --env <environment>   Filter by environment (development/staging/production)
  --model <model>       Filter by model
  --json                Output as JSON

Examples:
  prompt list
  prompt list --tag=medical
  prompt list --env=production --json
```

---

### `prompt show <name>`

Show prompt details.

```bash
prompt show <name> [options]

Arguments:
  name                  Prompt name (e.g., hospital/diagnosis)

Options:
  --version <version>   Show specific version
  --json                Output as JSON

Examples:
  prompt show hospital/diagnosis
  prompt show hospital/diagnosis --version=2
  prompt show hospital/diagnosis --json
```

---

### `prompt search <query>`

Search prompts by content.

```bash
prompt search <query> [options]

Arguments:
  query                 Search query

Options:
  --json                Output as JSON

Examples:
  prompt search "patient"
  prompt search "diagnosis" --json
```

---

### `prompt compile <name>`

Compile a prompt with variables (preview output).

```bash
prompt compile <name> [options]

Arguments:
  name                  Prompt name

Options:
  --input <key=value>   Input variable (can be repeated)
  --inputs-file <file>  JSON file with inputs
  --json                Output as JSON

Examples:
  prompt compile hospital/diagnosis \
    --input patientId=123 \
    --input symptoms='["fever","cough"]'
  
  prompt compile hospital/diagnosis --inputs-file test-inputs.json
```

---

### `prompt run <name>`

Compile and execute a prompt, return LLM response.

```bash
prompt run <name> [options]

Arguments:
  name                  Prompt name

Options:
  --input <key=value>   Input variable
  --inputs-file <file>  JSON file with inputs
  --model <model>       Override model
  --stream              Stream output
  --json                Output as JSON

Examples:
  prompt run hospital/diagnosis \
    --input patientId=123 \
    --input symptoms='["fever"]'
  
  echo '{"patientId": "123", "symptoms": ["fever"]}' | prompt run hospital/diagnosis
```

---

### `prompt test <name>`

Run test cases for a prompt.

```bash
prompt test <name> [options]

Arguments:
  name                  Prompt name (or --all for all prompts)

Options:
  --all                 Test all prompts
  --tag <tag>           Test prompts with tag
  --case <case>         Run specific test case
  --parallel <n>        Run n tests in parallel (default: 4)
  --json                Output as JSON

Examples:
  prompt test hospital/diagnosis
  prompt test hospital/diagnosis --case=basic-english
  prompt test --all --tag=production
  prompt test --all --json
```

**JSON Output:**
```json
{
  "prompt": "hospital/diagnosis",
  "success": false,
  "duration_ms": 5230,
  "tests": [
    {
      "name": "basic-english",
      "passed": true,
      "duration_ms": 1230,
      "tokens": 450,
      "cost": 0.023
    },
    {
      "name": "spanish-output",
      "passed": false,
      "error": "Language assertion failed: expected Spanish, got English",
      "duration_ms": 1180,
      "output": "The patient shows..."
    }
  ]
}
```

---

### `prompt benchmark <name>`

Run tests with detailed performance metrics.

```bash
prompt benchmark <name> [options]

Arguments:
  name                  Prompt name (or --all)

Options:
  --all                 Benchmark all prompts
  --tag <tag>           Benchmark prompts with tag
  --runs <n>            Number of runs per test (default: 3)
  --output <file>       Save results to file
  --compare <file>      Compare with previous benchmark
  --json                Output as JSON

Examples:
  prompt benchmark hospital/diagnosis
  prompt benchmark --all --output=benchmarks/2026-01-20.json
  prompt benchmark --all --compare=benchmarks/2026-01-15.json
```

---

### `prompt diff <a> <b>`

Compare two prompt versions.

```bash
prompt diff <a> <b> [options]

Arguments:
  a                     First prompt (name or name@version)
  b                     Second prompt (name or name@version)

Options:
  --json                Output as JSON

Examples:
  prompt diff hospital/diagnosis@v2 hospital/diagnosis@v3
  prompt diff hospital/diagnosis hospital/medication
```

---

### `prompt history <name>`

Show version history.

```bash
prompt history <name> [options]

Arguments:
  name                  Prompt name

Options:
  --limit <n>           Number of versions to show (default: 10)
  --json                Output as JSON

Examples:
  prompt history hospital/diagnosis
  prompt history hospital/diagnosis --limit=5 --json
```

---

### `prompt deploy`

Deploy prompts to Langfuse.

```bash
prompt deploy [options]

Options:
  --env <environment>   Target environment (staging/production)
  --tag <tag>           Deploy prompts with tag
  --prompt <name>       Deploy specific prompt
  --dry-run             Preview without deploying
  --confirm             Skip confirmation
  --json                Output as JSON

Examples:
  prompt deploy --env=staging
  prompt deploy --env=production --tag=production --confirm
  prompt deploy --prompt=hospital/diagnosis --env=staging
  prompt deploy --env=production --dry-run
```

---

### `prompt rollback <name>`

Rollback to previous version.

```bash
prompt rollback <name> [options]

Arguments:
  name                  Prompt name

Options:
  --to <version>        Rollback to specific version
  --env <environment>   Environment to rollback
  --confirm             Skip confirmation
  --json                Output as JSON

Examples:
  prompt rollback hospital/diagnosis --env=production --confirm
  prompt rollback hospital/diagnosis --to=v2 --env=production
```

---

### `prompt stats <name>`

Show usage statistics.

```bash
prompt stats <name> [options]

Arguments:
  name                  Prompt name

Options:
  --days <n>            Number of days (default: 7)
  --json                Output as JSON

Examples:
  prompt stats hospital/diagnosis
  prompt stats hospital/diagnosis --days=30 --json
```

---

### `prompt validate`

Validate all prompt definitions.

```bash
prompt validate [options]

Options:
  --json                Output as JSON

Examples:
  prompt validate
  prompt validate --json
```

---

### `prompt create <name>`

Create a new prompt from template.

```bash
prompt create <name> [options]

Arguments:
  name                  Prompt name (e.g., project/feature)

Options:
  --template <type>     Template type (default: basic)
  --json                Output as JSON

Examples:
  prompt create hospital/new-feature
  prompt create hospital/new-feature --template=agent
```

---

### `prompt browse`

Interactive TUI for browsing prompts.

```bash
prompt browse [options]

Options:
  --tag <tag>           Filter by tag
  --env <environment>   Filter by environment
```

Opens an interactive terminal UI:

```
┌─ Prompts ─────────────────────────────────────────────────────────────┐
│ > hospital/diagnosis           v3  production  gpt-4o    98.2% ✓     │
│   hospital/medication          v2  staging     gpt-4o    --          │
│   film-classifier/violence     v5  production  claude    95.1% ✓     │
│   film-classifier/rating       v2  production  gpt-4o    99.0% ✓     │
├───────────────────────────────────────────────────────────────────────┤
│ [↑↓] Navigate  [Enter] View  [t] Test  [r] Run  [d] Deploy  [q] Quit │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Prompt Definition Format

### Basic Structure

```yaml
# prompts/hospital/diagnosis/prompt.yaml

# Metadata
name: diagnosis
description: Summarizes patient diagnosis for doctors
tags: [medical, production, high-priority]
author: alice@company.com

# Model configuration
defaults:
  model: gpt-4o
  temperature: 0.3
  max_tokens: 1000

# Input schema
inputs:
  patientId:
    type: string
    required: true
    description: Patient identifier
  
  patientHistory:
    type: string
    required: true
    description: Patient medical history
  
  symptoms:
    type: array
    items: string
    required: true
    description: List of current symptoms
  
  labResults:
    type: string
    required: false
    description: Recent lab results if available
  
  language:
    type: string
    required: false
    default: English
    enum: [English, Spanish, French, Mandarin]
    description: Output language

# Output schema (for structured outputs)
output:
  type: object
  properties:
    summary:
      type: string
      description: Brief diagnosis summary
    concerns:
      type: array
      items: string
      description: Key concerns to address
    nextSteps:
      type: array
      items: string
      description: Recommended next steps
  required: [summary, concerns, nextSteps]

# System prompt
system: |
  You are a medical documentation assistant.
  You create clear, accurate summaries for physicians.
  Always be precise with medical terminology.
  Never provide medical advice directly to patients.

# User prompt template (Handlebars)
template: |
  Patient ID: {{patientId}}
  
  ## History
  {{patientHistory}}
  
  ## Current Symptoms
  {{#each symptoms}}
  - {{this}}
  {{/each}}
  
  {{#if labResults}}
  ## Lab Results
  {{labResults}}
  {{/if}}
  
  ---
  
  Provide a JSON response with: summary, concerns, nextSteps
  
  {{#if language}}
  Respond in {{language}}.
  {{/if}}
```

### Test Cases

```yaml
# prompts/hospital/diagnosis/tests.yaml

tests:
  - name: basic-english
    description: Basic diagnosis in English
    inputs:
      patientId: "TEST-001"
      patientHistory: "45-year-old male, history of hypertension"
      symptoms:
        - chest pain
        - shortness of breath
      language: English
    assertions:
      - type: valid-json
      - type: has-keys
        keys: [summary, concerns, nextSteps]
      - type: llm-judge
        criteria: "Summary accurately reflects the symptoms provided"
      - type: max-tokens
        value: 500
      - type: max-latency
        value: 5000

  - name: spanish-output
    description: Output should be in Spanish
    inputs:
      patientId: "TEST-002"
      patientHistory: "30-year-old female, no prior conditions"
      symptoms:
        - fever
        - cough
      language: Spanish
    assertions:
      - type: valid-json
      - type: language
        expected: Spanish

  - name: missing-optional-fields
    description: Should work without optional fields
    inputs:
      patientId: "TEST-003"
      patientHistory: "60-year-old male, diabetes"
      symptoms:
        - fatigue
      # labResults intentionally missing
      # language intentionally missing (should default to English)
    assertions:
      - type: valid-json
      - type: not-contains
        value: "Lab Results"  # Should not hallucinate
```

### Available Assertions

| Assertion Type | Description | Parameters |
|----------------|-------------|------------|
| `valid-json` | Output is valid JSON | - |
| `has-keys` | JSON has required keys | `keys: [...]` |
| `contains` | Output contains text | `value: "text"` |
| `not-contains` | Output doesn't contain text | `value: "text"` |
| `matches` | Output matches regex | `pattern: "..."` |
| `language` | Output is in language | `expected: "Spanish"` |
| `max-tokens` | Token count under limit | `value: 500` |
| `max-latency` | Latency under limit (ms) | `value: 5000` |
| `max-cost` | Cost under limit (USD) | `value: 0.10` |
| `llm-judge` | LLM evaluates quality | `criteria: "..."` |
| `custom` | Custom assertion function | `function: "path/to/fn"` |

---

## Prompt Repository Structure

```
prompts/
├── .promptrc.yaml                 # Global configuration
├── prompts/
│   ├── hospital-interpreter/
│   │   ├── diagnosis/
│   │   │   ├── prompt.yaml        # Prompt definition
│   │   │   ├── tests.yaml         # Test cases
│   │   │   └── CHANGELOG.md       # Version history
│   │   └── medication/
│   │       ├── prompt.yaml
│   │       └── tests.yaml
│   ├── film-classifier/
│   │   ├── violence-detection/
│   │   │   ├── prompt.yaml
│   │   │   └── tests.yaml
│   │   └── content-rating/
│   │       ├── prompt.yaml
│   │       └── tests.yaml
│   └── _shared/                   # Reusable partials
│       ├── json-output.yaml
│       └── safety-disclaimer.yaml
├── benchmarks/                    # Benchmark results
│   ├── 2026-01-15.json
│   └── 2026-01-20.json
└── package.json
```

### Global Configuration

```yaml
# .promptrc.yaml

# Default model settings
defaults:
  model: gpt-4o
  temperature: 0.7
  max_tokens: 2000

# Langfuse configuration
langfuse:
  publicKey: ${LANGFUSE_PUBLIC_KEY}
  secretKey: ${LANGFUSE_SECRET_KEY}
  baseUrl: ${LANGFUSE_URL}

# LiteLLM configuration (for testing)
litellm:
  baseUrl: ${LITELLM_URL}
  apiKey: ${LITELLM_KEY}

# Test configuration
testing:
  parallel: 4
  timeout: 30000
  defaultAssertions:
    - type: max-latency
      value: 10000

# Environments
environments:
  development:
    autoSync: false
  staging:
    autoSync: true
    requireTests: true
  production:
    autoSync: false
    requireTests: true
    requireApproval: true
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/prompts.yml

name: Prompts CI

on:
  push:
    paths:
      - 'prompts/**'
  pull_request:
    paths:
      - 'prompts/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install prompt CLI
        run: npm install -g @company/prompt-cli
      
      - name: Validate prompts
        run: prompt validate --json
  
  test:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install prompt CLI
        run: npm install -g @company/prompt-cli
      
      - name: Run tests
        run: prompt test --all --json
        env:
          LITELLM_URL: ${{ secrets.LITELLM_URL }}
          LITELLM_KEY: ${{ secrets.LITELLM_KEY }}
  
  deploy-staging:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Install prompt CLI
        run: npm install -g @company/prompt-cli
      
      - name: Deploy to staging
        run: prompt deploy --env=staging --confirm
        env:
          LANGFUSE_PUBLIC_KEY: ${{ secrets.LANGFUSE_PUBLIC_KEY }}
          LANGFUSE_SECRET_KEY: ${{ secrets.LANGFUSE_SECRET_KEY }}
          LANGFUSE_URL: ${{ secrets.LANGFUSE_URL }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires approval
    steps:
      - uses: actions/checkout@v4
      
      - name: Install prompt CLI
        run: npm install -g @company/prompt-cli
      
      - name: Deploy to production
        run: prompt deploy --env=production --tag=production --confirm
        env:
          LANGFUSE_PUBLIC_KEY: ${{ secrets.LANGFUSE_PUBLIC_KEY }}
          LANGFUSE_SECRET_KEY: ${{ secrets.LANGFUSE_SECRET_KEY }}
          LANGFUSE_URL: ${{ secrets.LANGFUSE_URL }}
```

---

## Agent Integration Example

An AI agent that improves prompts automatically:

```typescript
import { execSync } from 'child_process';
import { ai } from '@company/ai';

async function improvePrompt(promptName: string) {
  // 1. Get current prompt and stats
  const prompt = JSON.parse(
    execSync(`prompt show ${promptName} --json`).toString()
  );
  
  const stats = JSON.parse(
    execSync(`prompt stats ${promptName} --days=7 --json`).toString()
  );
  
  // 2. Get recent failures
  const failures = stats.recentErrors.slice(0, 5);
  
  if (failures.length === 0) {
    console.log('No failures to analyze');
    return;
  }
  
  // 3. Ask AI to suggest improvements
  const analysis = await ai.run('internal/prompt-improver', {
    inputs: {
      currentPrompt: prompt,
      failures: failures,
      successRate: stats.successRate,
    },
  });
  
  // 4. Test the suggestion
  const testResult = JSON.parse(
    execSync(
      `prompt test ${promptName} --override-template='${analysis.data.suggestedTemplate}' --json`
    ).toString()
  );
  
  // 5. If tests pass, create PR
  if (testResult.success) {
    console.log('Improvement validated! Creating PR...');
    // Create PR with the improvement
  } else {
    console.log('Suggested improvement failed tests:', testResult.errors);
  }
}
```

---

## Summary

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `@company/ai` | Unified AI SDK | Single interface, auto-tracing, typed outputs |
| `prompt` CLI | Prompt management | Test, deploy, benchmark, browse |
| Prompt YAML | Prompt definitions | Schema validation, test cases, version control |
| Langfuse | Runtime + observability | Prompt serving, traces, stats |
| LiteLLM | LLM routing | Fallbacks, cost tracking, rate limits |

**The key insight:** Prompts are a first-class concern, managed separately from application code, with their own development, testing, and deployment lifecycle.
