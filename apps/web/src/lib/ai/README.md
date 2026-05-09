# lib/ai

The Claude integration layer. **All Claude API calls go through here** — never call the SDK directly from a route handler.

```
ai/
├── client.ts    ← shared Anthropic SDK instance (server-only)
├── models.ts    ← model IDs + cost matrix
├── router.ts    ← {agentId, taskType} → {model, prompt, maxTokens}
├── prompts.ts   ← system prompt builder (persona + brain + task)
└── usage.ts     ← token usage logging (Phase 6: persist + enforce)
```

## Why a router?

Different tasks need different models. Standups don't need Opus; full PRDs do. The router centralises the matrix so cost optimisation stays maintainable.

```ts
import { route } from '@/lib/ai/router';
import { getAnthropic } from '@/lib/ai/client';

const { modelId, systemPrompt, maxOutputTokens, tier } = route({
  agentId: 'sarah',
  taskType: 'full-prd',
  project: ctx,
});

const client = getAnthropic();
const stream = await client.messages.stream({
  model: modelId,
  system: systemPrompt,
  max_tokens: maxOutputTokens,
  messages: [{ role: 'user', content: userMessage }],
});
```

## Agent-to-agent conversations

Two agents "talking" = two sequential router calls. Agent A's output is appended to `ProjectContext.recentDeliverables` before Agent B's prompt is built. The illusion of a conversation is created by streaming both responses to the Team Feed in order via SSE.

See `docs/AGENTS.md` for the full prompt architecture.
