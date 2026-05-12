# features/projects

Project-level UI: cards, switcher, settings.

## Components (planned)

- `ProjectCard` — used on `/app/home`. Shows name, description, agent stack, open task count, blocker count, last activity, "Open" CTA. Variants: active / has-blocker (red border) / archived (faded).
- `ProjectSwitcher` — dropdown in the dark sidebar, lists all projects + "New project" entry
- `NewProjectDialog` — kicks off the onboarding wizard

## Behaviour

- Lists are server-rendered from MongoDB.
- `ProjectCard` is purely presentational — props in, click out.
- Switching projects is a client-side `<Link>` (App Router will SSR the new shell).
