# components/agents

**Agent entity components.** Anything that visually represents an agent or their output.

- `AgentIconWrap` — coloured icon tile (varies by agent's bg color, see `lib/agents/registry.ts`)
- `AgentBadge` — name + role pill
- `DeskCard` — agent desk on the Office Floor (status ring + current task + progress)
- `ChatBubble` — single chat message (variant: agent vs user)
- `StandupCard` — daily standup row
- `TypingIndicator` — three bouncing dots while an agent generates

May import from `components/ui/` and `components/common/`. Reads agent metadata from `lib/agents/registry.ts` — never hard-code agent ids or colors.
