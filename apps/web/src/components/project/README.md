# components/project

**Project-scoped composites.** Built from agent components + primitives, but only meaningful inside a project context.

- `ProjectCard` — used on `/app/home`
- `OfficeFloor` — the signature spatial component (desks + meeting room)
- `TeamFeed` — live agent-to-agent conversation feed
- `DeliverablePanel` — right-side panel in agent DM
- `DeliverableCard` — a single output

May import from `components/ui/`, `components/common/`, `components/agents/`. Reads from server (route props or server actions); pushes mutation through API routes.
