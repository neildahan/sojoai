# Stack

Locked choices for Sojo AI. Don't substitute alternatives without a written reason.

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | React Server Components, route handlers, native streaming for SSE. |
| Language | TypeScript | 5.x | Strict mode, no `any`. |
| UI runtime | React | 19.x | Server Components, Suspense, transitions. |
| Styling | Tailwind CSS | 4.x | CSS-first config (`@theme` blocks in `globals.css`). |
| Components | shadcn/ui pattern | n/a | Copy-owned primitives in `components/ui/`. |
| Icons | lucide-react | ^0.460 | MIT, tree-shakeable, large catalogue. |
| Fonts | next/font + Google Fonts | n/a | Self-hosted, zero layout shift. Fraunces, Plus Jakarta Sans, JetBrains Mono. |
| Auth | Clerk | latest | Fastest Next.js integration. Uses Next 16 `proxy.ts` (renamed from middleware). |
| Database | MongoDB Atlas | n/a | Flexible schema for varied agent outputs. |
| ODM | Mongoose | ^8 | Schemas, validation, hooks. |
| AI | Anthropic Claude API + SDK | ^0.32 | All agent reasoning. Routed per-task to Haiku/Sonnet/Opus. |
| Validation | Zod | ^3 | Runtime validation at every external boundary. |
| Email | Resend | n/a | Daily standup digests. Phase 5. |
| Payments | Stripe | n/a | Subscriptions + metered usage. Phase 6. |
| Deployment | Vercel | n/a | Native Next.js, zero config. |

## Versions to know

- **Tailwind 4** changed the config model: tokens live in `@theme` blocks inside `globals.css`, not in a `tailwind.config.ts`. PostCSS uses `@tailwindcss/postcss`.
- **Next.js 16** renamed `middleware.ts` → `proxy.ts`. Same API surface.
- **Node ≥ 20.10**. Use `nvm use` to pick up `.nvmrc`.

## Why pnpm + workspaces

- Faster installs, deduped node_modules.
- Sets us up for a future `apps/worker` (cron standups, agent orchestration) without restructuring.
- Workspace root provides shared dev tooling (Prettier, base TS config).

## Model routing (cost optimisation)

Different agents and different task types use different Claude tiers. See [AGENTS.md](./AGENTS.md) and `apps/web/src/lib/ai/router.ts`. Inspired by Ruflo's per-task routing — clean-room build, no dependency on Ruflo.
