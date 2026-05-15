# features/hiring

The Hiring Room — browse all 10 agents, filter by category, hire one.

## Components

- `AgentCatalogCard` — large agent card used in the catalog grid. Shows the
  agent's icon-tile, name (Fraunces italic), role, pitch, and personality tags.
  Renders "Hire" CTA, or "Already on your team" disabled state when hired.

## Imports

- Reads the full agent list from `@/lib/agents/registry`
- Uses `@/components/ui/*` primitives + `@/features/agents/components/AgentIconWrap`

## Hire flow

Until Mongo lands, "Hire" is a stub that redirects back to the project's
team-room. Phase 3.2 will write a `Team` doc with `(projectId, agentId)` and
update `ProjectBrain` if a category hand-off is implied.
