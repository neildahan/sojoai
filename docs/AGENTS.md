# Agents

> The 10 Sojo AI agents — what they do, how they're prompted, and how they "talk to each other".

---

## The roster

| Id | Name | Role | Default tier | Bg color | Lucide icon |
|---|---|---|---|---|---|
| `jamie` | Jamie | Scrum Master | Haiku | `#E0E7FF` | Compass |
| `sarah` | Sarah | Product Manager | Sonnet (Opus for full PRD) | `#EEF0FF` | ClipboardList |
| `alex` | Alex | UI/UX Designer | Sonnet | `#FEF3C7` | PenTool |
| `lena` | Lena | Frontend Engineer | Sonnet | `#ECFDF5` | Monitor |
| `marcus` | Marcus | Backend Engineer | Sonnet (Opus for architecture) | `#F0FDF4` | Server |
| `nina` | Nina | QA Engineer | Haiku (Sonnet for full plans) | `#FFF7ED` | Bug |
| `ryan` | Ryan | Security Expert | Sonnet (Opus for full audits) | `#FEF2F2` | Shield |
| `david` | David | DevOps Engineer | Haiku | `#F5F4F0` | Cloud |
| `mia` | Mia | Marketing Lead | Sonnet | `#FDF4FF` | Megaphone |
| `kai` | Kai | Social Media | Haiku | `#FFF1F2` | TrendingUp |

The canonical source is `apps/web/src/lib/agents/registry.ts`. **Never hard-code agent data elsewhere.** UI components read from the registry, the Claude router reads from the registry, models reference agents by `id`.

---

## System prompt architecture

Each agent's system prompt is composed of three layers, in order:

```
┌─ Persona ────────────────┐   stable per agent
│ "You are Sarah, the PM…" │   personality + voice
└──────────────────────────┘
            │
┌─ ProjectBrain ───────────┐   injected from MongoDB ProjectBrain doc
│ - description            │   the same brain Alex / Marcus / Ryan read
│ - PRD                    │
│ - tech stack             │
│ - recent deliverables    │
│ - GitHub / Figma summary │
└──────────────────────────┘
            │
┌─ Task instruction ───────┐   varies per call
│ "Produce a complete PRD" │   chat / standup / full-prd / audit / …
└──────────────────────────┘
```

Implemented in `apps/web/src/lib/ai/prompts.ts`. Use `route()` from `@/lib/ai/router` — never call the Claude SDK directly.

---

## Model routing

Different tasks need different models. Cost optimisation inspired by Ruflo (clean-room build). The router lives at `apps/web/src/lib/ai/router.ts`.

Defaults:
- **Haiku** — Jamie, David, Kai, Nina (when summarising)
- **Sonnet** — Sarah, Alex, Lena, Marcus, Ryan, Mia
- **Opus** — only for: `full-prd`, `architecture-decision`, `security-audit`

If you need to override (user explicitly requests "go deep"), pass `forceTier: 'opus'`.

---

## Agent-to-agent "conversations"

There is no inter-agent messaging protocol. They share state via `ProjectBrain`.

Sequence diagram:

```
User       Sarah          ProjectBrain      Alex          UI (Team Feed)
 │           │                  │             │                 │
 │ hire Alex │                  │             │                 │
 │──────────►│                  │             │                 │
 │           │ writes PRD       │             │                 │
 │           │─────────────────►│             │                 │
 │           │                  │             │                 │
 │           │                  │ read by Alex│                 │
 │                              ├────────────►│                 │
 │                              │             │ generates designs│
 │                              │             │────────────────►│
 │                              │             │                 │ live render
```

In the UI, both Sarah's and Alex's outputs are streamed sequentially into the **#general** Team Feed, formatted as a conversation.

---

## Streaming

All agent calls use the Anthropic SDK's `messages.stream()`. The route handler forwards chunks to the browser as Server-Sent Events. Never buffer a full completion before sending.

The live endpoint is **`POST /api/projects/[projectId]/chat/[agentId]`**. Event format:

```
data: {"type":"delta","text":"…token chunk…"}
data: {"type":"done","usage":{"inputTokens":…,"outputTokens":…}}
data: {"type":"error","message":"…"}
```

The client helper in `features/chat/lib/streamReply.ts` handles parsing. `ChatPanel` calls it on every send and falls back to a friendly stub message when the stream errors (e.g. no `ANTHROPIC_API_KEY`).

---

## Token usage

Every Claude call records usage via `recordUsage()` in `lib/ai/usage.ts`. In Phase 6 this enforces plan tier limits (see `sojoai-project-plan.md` pricing tiers).

---

## Adding a new agent

1. Add to `apps/web/src/lib/agents/registry.ts` (id, name, role, icon, bg, default tier, pitch, personality).
2. Decide if any task type belongs to them and update `lib/ai/prompts.ts` if their voice needs special handling.
3. Add their swatch to `docs/STYLE.md`.
4. The Hiring Room and Office Floor pick them up automatically — no UI changes needed.
