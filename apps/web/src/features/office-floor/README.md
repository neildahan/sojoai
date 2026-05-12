# features/office-floor

The signature spatial UI of Sojo AI. Open `sojoai-design-system-v3.html` in a browser as a pixel reference.

## Components (planned)

- `OfficeFloor` — the grid container; arranges `DeskCard`s and the `MeetingRoom`
- `DeskCard` — a single agent's desk: icon-wrap, name, status ring, current task, progress bar, "Message" button
- `MeetingRoom` — agents-in-conversation block, spans 2 columns, dashed indigo border with `glow-ring` pulse
- `EmptyDeskSlot` — "+" card linking to the Hiring Room

## Imports

- Pulls agent metadata + status from server props.
- Uses `@/features/agents/components/AgentIconWrap` and `StatusRing`.
- The "Message" button on a desk navigates to `/app/[projectId]/messages/[agentId]` — uses Next.js `Link`, not router.push.

## Non-negotiables

- Spatial metaphor stays. Don't reduce the floor to a card grid in the name of "simplification".
- Meeting Room MUST span 2 columns and pulse — it's the anchor of the metaphor.
- Status rings must animate via `animate-glow-ring` for `talking` status; respect `prefers-reduced-motion`.
