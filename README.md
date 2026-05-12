# Sojo AI

> A virtual AI team for builders — hire, talk to, and collaborate with 10 specialist agents that produce real deliverables.

Sojo AI gives any user (entrepreneur, freelancer, startup) a virtual AI-powered team. Each agent has a name, role, personality, and area of expertise. Agents talk to each other, produce real deliverables (PRDs, designs, code, security reports), and run daily standups. The signature UX is the **Office Floor** — a spatial metaphor with agent desks, status rings, and a meeting room.

Live at [sojoai.app](https://sojoai.app).

---

## Quickstart

```bash
# install pnpm if needed: https://pnpm.io/installation
nvm use            # picks up .nvmrc → Node 20
pnpm install
pnpm dev           # starts apps/web on http://localhost:3000
```

Required env vars are documented in `apps/web/.env.example`.

---

## Repo layout

```
SojoAI/
├── apps/
│   └── web/                       # Next.js 16 App Router app (@sojoai/web)
│       └── src/
│           ├── app/               # routes
│           ├── components/        # ui/ (shadcn primitives) + layout/ (app shell)
│           ├── features/          # feature-first: agents, office-floor, chat, …
│           └── lib/               # shared infra: registry, ai, db, env, utils
├── docs/                          # Project-wide guides (read these!)
│   ├── STACK.md                   # Locked tech choices and why
│   ├── ARCHITECTURE.md            # App Router layout + ProjectBrain pattern
│   ├── COMPONENTS.md              # Component layering and conventions
│   ├── AGENTS.md                  # The 10 agents + system-prompt structure
│   ├── STYLE.md                   # Design tokens, fonts, color rules
│   ├── RULES.md                   # Best-practice development rules
│   └── CONTRIBUTING.md            # Branching, commits, PR conventions
├── sojoai-project-plan.md         # Original product plan (still references "A-Team" in prose)
├── sojoai-design-system-v3.html   # Canonical visual reference — open in a browser
├── sojoai-ui-ux-pro.skill         # Optional Claude UX skill
├── pnpm-workspace.yaml
└── package.json
```

---

## Documentation

Start here:

- **[docs/RULES.md](./docs/RULES.md)** — non-negotiable dev rules (TS, a11y, security, testing, commits)
- **[docs/STACK.md](./docs/STACK.md)** — what we use and why
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — how the app is structured
- **[docs/AGENTS.md](./docs/AGENTS.md)** — the agent roster and how they work
- **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** — component layers and conventions
- **[docs/STYLE.md](./docs/STYLE.md)** — design tokens
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** — how to contribute

---

## Status

Phase 1 — Foundation. See `sojoai-project-plan.md` for the full roadmap.

---

## License

Proprietary — all rights reserved.
