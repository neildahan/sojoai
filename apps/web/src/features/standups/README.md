# features/standups

Daily standup UI — automated by Jamie (Scrum Master) and triggerable on demand.

## Components (planned)

- `StandupCard` — per-agent: icon-wrap, name, role, today's update, status tag (On track / In discussion / Blocked)
- `StandupSummaryView` — Jamie's compiled summary above the cards
- `StandupHistoryList` — past standups (date-sorted)

## Behaviour

- Cron (Phase 5) fires at the configured `Project.settings.standupTime`.
- Jamie pulls each agent's task state, asks each agent for a 1-3 line update, compiles into a summary.
- Email digest sent via Resend to the user.
- "Run standup now" button on the Team Room triggers the same flow on demand.
