# Architecture

> How Sojo AI is wired together. Read [AGENTS.md](./AGENTS.md) for the AI side of the system, [COMPONENTS.md](./COMPONENTS.md) for the UI side.

---

## Top-level data flow

```
                                       ┌────────────────┐
                                       │  Browser       │
                                       │  (React SC +   │
                                       │   client UI)   │
                                       └───┬────────┬───┘
                            HTML + RSC ┌───┘        │ SSE stream (chat)
                                       ▼            ▼
                              ┌───────────────────────────┐
                              │  Next.js (apps/web)       │
                              │  ┌──────────┐ ┌────────┐  │
                              │  │ pages/   │ │ route  │  │
                              │  │ layouts  │ │ handlers│ │
                              │  └────┬─────┘ └───┬────┘  │
                              │       └─────┬─────┘       │
                              │             ▼             │
                              │      ┌────────────┐       │
                              │      │   lib/     │       │
                              │      │ ai/ db/ ...│       │
                              │      └─────┬──────┘       │
                              └────────────┼──────────────┘
                                           │
                ┌──────────────────────────┼──────────────────────────┐
                ▼                          ▼                          ▼
          ┌──────────┐              ┌─────────────┐            ┌────────────┐
          │ Clerk    │              │ MongoDB     │            │ Anthropic  │
          │ (auth)   │              │ Atlas       │            │ Claude API │
          └──────────┘              └─────────────┘            └────────────┘
                                          │
                                          │ (also: GitHub / Figma /
                                          │  Notion / Stripe / Resend
                                          │  via OAuth + REST)
```

---

## Routing layout

Sojo AI uses the Next.js App Router. Three top-level segments:

```
src/app/
├── (marketing)/        ← public: /, /pricing
├── (auth)/             ← /login, /sign-up (Clerk)
└── app/                ← authenticated workspace
    ├── home/           ← /app/home (cross-project list)
    ├── onboarding/     ← /app/onboarding/{start,describe,needs,connect,meet}
    └── [projectId]/    ← per-project routes
        ├── team-room/
        ├── messages/
        │   ├── [agentId]/
        │   ├── general/
        │   └── meeting/
        ├── tasks/
        ├── deliverables/
        ├── integrations/
        ├── settings/
        └── hire/
```

Route groups (`(marketing)`, `(auth)`) don't appear in the URL — they exist to give each shell its own layout.

---

## Server vs Client Components

- **Default to Server Components.** Faster, smaller bundles, direct DB access.
- `'use client'` only when you need state, effects, browser APIs, or event handlers.
- Heavy interactivity (the Office Floor, chat) is leaf-level client islands inside server pages.
- Data fetching happens on the server. Pass props down — never `fetch` from `useEffect`.

---

## The ProjectBrain pattern (the AI backbone)

Every project has one **ProjectBrain** document — the shared memory all agents read from. When Sarah writes a PRD, it lands in `ProjectBrain.prd`. When Alex is invoked next, the prompt builder injects that PRD into Alex's system prompt.

> The "agents talking to each other" experience is an illusion. They're all reading the same shared brain, and we display the sequential outputs as a conversation.

Flow:

```
User action (hire / message / cron)
   ↓
Route handler (apps/web/src/app/api/.../route.ts)
   ↓
lib/ai/router.ts          ← picks model + builds system prompt
   ↓
lib/ai/client.ts          ← Anthropic SDK call (streaming)
   ↓ chunk by chunk via SSE
Browser Team Feed         ← live render
   ↓ on completion
ProjectBrain update + Conversation insert + Deliverable insert
```

See `apps/web/src/lib/ai/README.md` for the code-level walkthrough.

---

## Streaming (SSE)

Agent responses stream token-by-token. We use **Server-Sent Events** via Next.js route handlers with `text/event-stream`. SSE is one-way (server → client) which is exactly what we need for chat. WebSockets would be overkill.

The Anthropic SDK exposes `messages.stream()`; we forward chunks straight to the response with backpressure.

---

## Auth

- Clerk handles session, OAuth, and the sign-in UI.
- Auth state is read in route handlers via `auth()` from `@clerk/nextjs/server`.
- We sync Clerk userId → our `User` model on first sign-in (Clerk webhook).
- All `/app/*` routes require auth; enforced in `proxy.ts` (Next 16 renaming of middleware).

---

## Multi-project scope

Every domain entity has a `projectId`. Queries always include it. The user's home screen (`/app/home`) is the only cross-project view.

---

## Long-running work

Daily standups, agent-to-agent orchestration, integration sync — these don't belong in serverless route handlers. **Phase 5** introduces `apps/worker/` with cron jobs (Inngest or a worker service). For now, standup runs are triggered on demand via a route handler.
