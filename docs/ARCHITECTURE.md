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

Sojo AI uses the Next.js App Router. Routes split by chrome:

```
src/app/
├── page.tsx                   ← / (marketing landing)
├── pricing/                   ← /pricing
├── (auth)/                    ← /sign-in, /sign-up (Clerk components, themed)
├── dev/components/            ← /dev/components (internal playground; 404 in prod)
├── api/
│   ├── projects/[projectId]/chat/[agentId]/   ← POST: SSE Claude stream
│   └── webhooks/clerk/                        ← Clerk user lifecycle webhook
└── app/                                       ← authenticated workspace
    ├── (cross-project)/                       ← TopBar shell (cross-project routes)
    │   ├── page.tsx                           ← /app  → redirect to /app/home
    │   └── home/                              ← /app/home (project list)
    ├── (onboarding)/                          ← minimal no-chrome shell
    │   └── onboarding/{start,describe,connect,needs,meet}/
    └── [projectId]/                           ← Sidebar shell (project routes)
        ├── page.tsx                           ← redirect → /team-room
        ├── team-room/
        ├── messages/
        │   ├── page.tsx                       ← DM list + #general entry
        │   ├── [agentId]/                     ← DM with one agent
        │   └── general/                       ← #general team feed
        ├── tasks/
        ├── deliverables/
        ├── integrations/
        ├── settings/
        └── hire/
```

Route groups (`(auth)`, `(cross-project)`, `(onboarding)`) don't appear in the URL — they exist to give each chrome its own layout. `[projectId]` gets the dark Sidebar; cross-project gets a light TopBar; onboarding gets neither.

Auth is enforced by `proxy.ts` (Next 16's renamed middleware) for any path under `/app(.*)`.

---

## Code organisation

Sojo AI uses **feature-first** code organisation:

```
apps/web/src/
├── app/             ← routes (with _components/ for route-local UI)
├── components/
│   ├── ui/          ← shadcn-style primitives only
│   └── layout/      ← Sidebar, TopBar, PageWrapper
├── features/        ← domain folders: agents, office-floor, chat, deliverables, tasks, standups, projects
└── lib/             ← shared infra: agents/registry, ai/, db/, env, utils
```

See [`COMPONENTS.md`](./COMPONENTS.md) for the rules on where things go.

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
