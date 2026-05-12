# features/tasks

Per-agent and master task boards.

## Components (planned)

- `TaskBoard` — kanban (Todo / In Progress / Done / Blocked)
- `TaskList` — list view (default for master view)
- `TaskCard` — title + description snippet + agent + priority + status
- `TaskFilters` — agent multi-select, status, priority
- `NewTaskDialog` — modal for user-created tasks

## Behaviour

- User can create tasks. Agents create tasks automatically as their work breaks down.
- Jamie (Scrum Master) reviews and re-prioritises during standup.
- Status changes trigger optimistic UI updates with a server reconciliation.
