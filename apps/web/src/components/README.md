# Components

This folder is intentionally small. Sojo AI uses **feature-first organisation** — domain components live in [`src/features/`](../features/README.md), not here.

```
components/
├── ui/        ← shadcn-style primitives ONLY: Button, Input, Dialog, Toast, Skeleton, Badge, …
└── layout/    ← app shell: Sidebar, TopBar, PageWrapper, Breadcrumb
```

## What goes here vs in features/

| Question | Answer |
|---|---|
| Is it a **headless primitive** (Button, Input, Dialog, Tooltip)? | `components/ui/` |
| Is it part of the **app shell** (Sidebar, TopBar, BreadCrumb)? | `components/layout/` |
| Does it represent a **domain concept** (agent, project, deliverable, task, chat)? | `features/<feature>/components/` |
| Is it used by **only one route** and won't be reused? | `app/<route>/_components/` |

## Why so small?

`components/` is for *project-agnostic* UI primitives and global chrome. Anything else has a feature it belongs to — and locality wins over a one-size-fits-all `components/` folder once the app passes ~20 components.

See [`docs/COMPONENTS.md`](../../../../docs/COMPONENTS.md) for full conventions and [`src/features/README.md`](../features/README.md) for the feature-first rules.
