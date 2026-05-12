# components/ui

**shadcn-style primitives.** Button, Badge, Input, Textarea, Dialog, Toast, Tooltip, Skeleton, EmptyState — anything that's a project-agnostic UI building block.

These should be reusable in any project. No Sojo AI domain concepts, no agent-specific styling, no business logic. shadcn/ui pattern: **each primitive is owned by us in this folder**, not imported from a node_module — so we can tune to the design tokens directly.

Adding a primitive via the shadcn CLI (when we install it) drops it here automatically.

## Conventions

- One component per file, named `kebab-case.tsx` (shadcn convention) — e.g. `button.tsx` exporting `<Button>`.
- Use `cn()` from `@/lib/utils` to merge `className` props (clsx + tailwind-merge).
- Variants via [`class-variance-authority`](https://cva.style/) when the matrix is non-trivial.
- Forward refs (`React.forwardRef`) and spread `...rest` props.
- `'use client'` only when the primitive needs interactivity (Button needs it for events; Skeleton doesn't).
- Pull all colors and shadows from theme tokens (`bg-warm-900`, `shadow-card`) — never hard-code hex.

## What does NOT belong here

- Anything that knows about an agent, project, deliverable, task — that's a `features/` component.
- Anything tied to the app shell (Sidebar, TopBar) — that's `components/layout/`.
- Page composition — that lives in `app/<route>/page.tsx` or in a feature.
