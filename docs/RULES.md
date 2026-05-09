# Development Rules

These rules are non-negotiable defaults for Sojo AI. Deviate only with a written reason in the PR description.

---

## TypeScript

- **Strict mode is on**, including `noUncheckedIndexedAccess` and `noImplicitOverride`.
- Never use `any`. Prefer `unknown` and narrow with type guards or Zod.
- Exported functions and public APIs MUST have explicit return types.
- Validate every external input (HTTP body, query, env, third-party response) with **Zod** before use. Internal data is trusted; boundary data is not.
- Prefer `type` for unions/intersections, `interface` for object contracts that may be extended.
- Exhaustive `switch` checks: end with `default: const _exhaustive: never = x;`

## React / Next.js

- Default to **Server Components**. Add `'use client'` only when you need state, effects, browser APIs, or event handlers.
- Never fetch data inside a `useEffect` — fetch on the server in the page/layout, or use a server action.
- Route handlers (`app/api/*/route.ts`) stay thin: validate input, delegate to `lib/`, return a typed response.
- Co-locate route-only components inside the route folder; promote to `components/` only when reused.
- Streaming responses (SSE) must flush headers immediately and handle client disconnect.

## Naming

| Kind | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `AgentIconWrap.tsx` |
| Hook file | `useCamelCase.ts` | `useAgentStatus.ts` |
| Util / lib file | `kebab-case.ts` | `claude-router.ts` |
| Route folder | `kebab-case` | `team-room/` |
| Type / interface | `PascalCase` | `AgentId` |
| Variable / function | `camelCase` | `getAgent` |
| Constant | `UPPER_SNAKE` | `MAX_CONTEXT_TOKENS` |
| Env var | `UPPER_SNAKE` with prefix | `CLAUDE_API_KEY`, `NEXT_PUBLIC_*` |

## Accessibility

- Use semantic HTML first; ARIA only to fill gaps.
- Every interactive element must be keyboard reachable and have a visible `:focus-visible` state.
- Color is never the sole signal — pair with text or icon.
- Images and icons used as controls require `aria-label`. Decorative icons get `aria-hidden="true"`.
- Respect `prefers-reduced-motion` for the status-ring and pulse animations.

## Security

- Never log secrets, tokens, or PII. Redact before logging.
- All env access goes through `lib/env.ts` (Zod-parsed). Never read `process.env.X` ad-hoc.
- Mongoose queries only — no string interpolation into Mongo operators.
- Set CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` headers via `next.config.js` or middleware.
- OAuth tokens stored encrypted at rest (use a `lib/crypto.ts` wrapper, not raw values in the DB).
- Rate-limit every public API route. Authenticated routes get per-user limits via Clerk userId.
- Treat Claude outputs as untrusted text — never `eval`, never inject into HTML without sanitization, never run as code without explicit user confirmation.

## Errors & logging

- Throw at the boundary you discover the error; catch at the route handler / top-level.
- Never `console.log` in production code paths. Use a structured logger (`lib/log.ts`) with levels.
- User-facing errors are friendly + opaque; logs get the full detail.
- Wrap external calls (Claude API, Stripe, Mongo) with retries + timeouts; surface a typed error.

## Testing

- **Unit:** Vitest, co-located as `*.test.ts(x)` next to the file under test.
- **Integration:** real MongoDB (test DB) — never mock the database. Past mock/prod divergence is the reason this rule exists.
- **e2e:** Playwright, against a built app and real APIs (or recorded fixtures).
- Every bug fix lands with a regression test that fails before the fix.
- Coverage is a side effect, not a target — don't write tests to hit a number.

## Git, commits, PRs

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `perf:`, `ci:`. One concern per commit.
- One concern per PR. PR description explains the **why**, not just the what.
- Never force-push shared branches. Never skip hooks (`--no-verify`) without explicit approval.
- Branch names: `<type>/<short-slug>` — e.g. `feat/office-floor-component`.

## Performance

- Measure before optimizing — bundle analyzer, React Profiler, server timing.
- Code-split heavy client bundles; don't ship Mongoose to the browser.
- Avoid client-side waterfalls — fetch data on the server and pass down.
- Images via `next/image`. Fonts via `next/font` only.
- Stream long agent responses; never buffer a full Claude completion before sending.

## Code style

- Prettier + ESLint enforced in CI. Format-on-save locally.
- No commented-out code. No unused exports. No dead branches.
- Comments explain **why**, never what. Default to no comment unless a reader would be surprised.
- Two similar copies is fine; three means it's time to abstract.

## When unsure

Ask before deviating. The cost of a five-minute clarification is always less than the cost of an unwanted refactor.
