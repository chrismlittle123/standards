
## Frontend

All frontends use Next.js with the `palindrom-ai/ui` component library.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `palindrom-ai/ui` (shadcn/ui-based components)
- Vercel for deployment

### Architecture

Frontend and backend are always separate:

- Separate repositories
- Separate deployments
- Frontend calls backend APIs — no business logic in Next.js

### API Routes

Only allowed as a thin BFF layer:

- Auth token exchange
- Aggregating backend calls
- Proxying to avoid CORS

**Not allowed:** Business logic, database access, anything requiring unit tests.

### Components

Use `palindrom-ai/ui` for all components. For new components, extend the library rather than adding one-off components to your project.

```bash
pnpm add palindrom-ai/ui
```
