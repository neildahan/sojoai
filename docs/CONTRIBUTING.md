# Contributing

> Read [RULES.md](./RULES.md) first — those are non-negotiable. This doc covers workflow.

---

## Setup

```bash
nvm use            # picks up .nvmrc → Node 20+
pnpm install
cp apps/web/.env.example apps/web/.env.local
# fill in keys
pnpm dev
```

---

## Branching

- `main` is always deployable.
- Branch from main: `<type>/<short-slug>`.
  - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`.
  - Examples: `feat/office-floor`, `fix/clerk-callback-redirect`, `docs/agent-roster-update`.
- Never push directly to `main`. PR + review.

---

## Commits

[Conventional Commits](https://www.conventionalcommits.org/). One concern per commit.

```
feat(office-floor): add meeting-room pulse animation
fix(chat): drop SSE connection cleanly on client unmount
chore(deps): bump @anthropic-ai/sdk to 0.32.1
docs: clarify ProjectBrain handoff rule
```

The body explains **why**, not what. The diff already shows the what.

---

## Pull Requests

- One concern per PR. If you find a tangential cleanup, file a follow-up PR — don't bundle.
- PR description answers: *what does this change, why, and how was it verified?*
- Include screenshots / screen recordings for any UI change.
- Self-review before requesting a review. Read your own diff.
- All checks must be green: type-check, lint, tests, build.

---

## Code review

- Trust but verify. Run the branch locally for any non-trivial change.
- Comment on intent, not just typos.
- Block on rule violations. Suggest on style.

---

## Testing

See [RULES.md → Testing](./RULES.md#testing). Every bug fix lands with a regression test.

---

## Adding a dependency

- Justify it in the PR description. What does it do that we couldn't do in 50 lines?
- Check bundle impact (server-only deps don't matter; client deps do).
- Pin a major version in `package.json`. No `*` or `latest`.

---

## Updating docs

When you change behavior, update the relevant doc in the same PR:

| Change | Update |
|---|---|
| Add an agent | `docs/AGENTS.md`, `apps/web/src/lib/agents/registry.ts` |
| Add a token | `docs/STYLE.md`, `apps/web/src/app/globals.css` |
| Change architecture | `docs/ARCHITECTURE.md` |
| Add a component layer or convention | `docs/COMPONENTS.md` |
| Change a rule | `docs/RULES.md` (with `Why:` line) |

Stale docs are worse than no docs — they mislead.
