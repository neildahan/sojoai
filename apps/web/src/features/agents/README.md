# features/agents

Agent entity components — anything that visually represents an agent.

## Components (planned)

- `AgentIconWrap` — coloured icon tile (bg from `lib/agents/registry.ts`)
- `AgentBadge` — name + role pill (Fraunces italic for the name)
- `StatusRing` — animated `glow-ring` for in-conversation; static for active/blocked/idle
- `TypingIndicator` — three bouncing dots (uses `animate-bounce-dot`)

## Imports

- Reads agent metadata (name, role, icon, bg, default model tier) from `@/lib/agents/registry` — never hard-code agent ids or colors.
- Uses `@/components/ui/*` primitives.
- Does NOT import from other features.
