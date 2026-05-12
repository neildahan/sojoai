# features/chat

DM, team feed, and meeting chat UIs. Streams via Server-Sent Events from `/api/projects/[id]/chat/[agentId]`.

## Components (planned)

- `ChatPanel` — full chat shell (used in DM and team-feed views)
- `MessageThread` — scrollable list of `ChatBubble`s
- `ChatBubble` — one message; variant: `agent` (warm gray, `0 rmd rmd rmd`) vs `user` (dark, `rmd 0 rmd rmd`, right-aligned)
- `MessageInput` — textarea with `⌘↵ to send` hint and Send button (icon)
- `MessageMeta` — tiny timestamp + token-tier indicator (mono font)

## Streaming

- Use `fetch` with `Response.body.getReader()` against the SSE endpoint, OR the `EventSource` API.
- Append tokens to the bubble in-place. Don't re-render the entire thread on every chunk.
- On disconnect, abort the fetch via `AbortController`.

## Imports

- `TypingIndicator` lives in `@/features/agents/components/` (it's an agent concept), reuse from there.
- Uses `@/components/ui/*` primitives.
