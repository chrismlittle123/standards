
## Backend Deployment

All backends deploy to AWS via SST. Choose the right compute for your workload.

### When to Use What

| Workload | Compute | Why |
|----------|---------|-----|
| LLM services, long requests | ECS Fargate | No cold starts, no timeout limits |
| Simple APIs, low traffic | Lambda | Scales to zero, cost effective |

### ECS Fargate (Heavy Workloads)

For LLM services and APIs with long-running requests:

```typescript
// sst.config.ts
new Service(stack, "api", {
  path: ".",
  port: 3000,
  cpu: "0.5 vCPU",
  memory: "1 GB",
  scaling: {
    minContainers: 1,
    maxContainers: 4,
  },
});
```

Requires a `Dockerfile` in the project root.

### Lambda (Simple APIs)

For simple, low-traffic APIs:

```typescript
// sst.config.ts
new Function(stack, "api", {
  handler: "src/index.handler",
  runtime: "nodejs20.x",
  timeout: "30 seconds",
});
```

### Docker

ECS deployments require a Dockerfile:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["node", "dist/index.js"]
```
