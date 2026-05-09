# lib/db

MongoDB + Mongoose. **All DB access goes through here** — never call `mongoose` directly from a route handler.

```
db/
├── connect.ts          ← cached connection helper (call before any model use)
└── models/
    ├── User.ts
    ├── Project.ts
    ├── Team.ts                ← which agents are hired on which project + status
    ├── Conversation.ts        ← DMs, team feed, meetings
    ├── Deliverable.ts         ← PRDs, designs, code, reports
    ├── Task.ts                ← per-agent task list
    ├── ProjectBrain.ts        ← shared memory all agents read from
    ├── StandupSummary.ts      ← daily standup digests
    └── index.ts
```

## Usage

```ts
import { connectDb } from '@/lib/db/connect';
import { Project } from '@/lib/db/models';

export async function GET() {
  await connectDb();
  const projects = await Project.find({ userId }).lean();
  // ...
}
```

## Rules

- Always `await connectDb()` before the first model call in a request.
- Use `.lean()` for reads when you don't need Mongoose docs (faster, plain objects).
- All cross-model relations are scoped to `projectId`. Always include it in queries — never look up by `_id` alone for project-scoped data.
- Indexes are declared on the schemas. If you need a new query pattern, add the index there, not as a one-off.
- `ProjectBrain` is the shared agent memory. Treat it as the canonical source — see `docs/AGENTS.md`.
