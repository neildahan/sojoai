# features/deliverables

Deliverables — the real outputs agents produce (PRDs, designs, code, security reports). Rendered as Markdown, exportable to Google Docs / Notion / Confluence.

## Components (planned)

- `DeliverablePanel` — right-side panel in agent DM (35% width, always visible)
- `DeliverableCard` — single output: icon-wrap, title, type badge, date, View + Export
- `DeliverableViewer` — Markdown renderer for the main reading area
- `ExportBar` — Google Docs / Notion / Confluence / Download buttons

## Markdown rendering

Use `react-markdown` with a sanitiser. Treat all Claude output as untrusted text — no raw HTML, no script tags. (See `docs/RULES.md` → Security.)

## Imports

- Uses `@/features/agents/components/AgentIconWrap` for the per-deliverable icon.
- Uses `@/components/ui/*` primitives.
