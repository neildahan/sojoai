# components/layout

**App shell.** Sidebar, TopBar, PageWrapper, Breadcrumb.

The dark sidebar (`#1A1814`) is global to project routes and never appears on `/app/home` or marketing routes. Layouts in `app/` wire this up — components here just render the chrome.

## What lives here

- `Sidebar` — dark sidebar with nav, project label, divider, all-projects link, settings
- `TopBar` — bell + user avatar; rendered on `/app/home` (no sidebar context)
- `PageWrapper` — vertical rhythm container used inside project routes
- `Breadcrumb` — small contextual breadcrumb above page titles when relevant

## What does NOT live here

- `ProjectSwitcher` — that's a feature concept (it knows about projects), so it lives in `features/projects/components/ProjectSwitcher.tsx`. The Sidebar slots it in via children/composition.

## Conventions

- These are presentational. They take props (e.g. `<Sidebar projectName={...} navItems={...}>`), not data hooks.
- Server Components by default. `'use client'` only for the bits that need interactivity (collapsible sections, focus trap).
