# Components

Sojo AI components are organised in **layers**. Each layer has a clear responsibility — pick the right one when adding new components.

```
components/
├── ui/        ← primitives: Button, Badge, Input, Avatar (shadcn-style, headless-ish)
├── common/    ← cross-cutting reusables: Toast, Modal, EmptyState, ErrorBoundary
├── agents/    ← agent-specific entity components: AgentIconWrap, DeskCard, ChatBubble, StandupCard
├── project/   ← project-scoped: ProjectCard, OfficeFloor, TeamFeed, DeliverablePanel
└── layout/    ← Sidebar, TopBar, PageWrapper, BreadCrumb
```

## Rules

1. **One source of truth per primitive.** Status rings, agent icons, badges, buttons — each has exactly one component. Variants via props/className, never via copy-pasted files.
2. **Search before writing.** Before creating a new component, grep `components/` for an existing one to extend.
3. **Up the chain only.** A component may import from layers _below_ it, never above. `agents/*` may import `ui/*` and `common/*`. `ui/*` imports nothing from this tree.
4. **Co-locate the example.** When you add or change a component, update an example in `docs/COMPONENTS.md`.
5. **Typed props.** Every component takes a typed `Props` interface. Defaults are explicit.
6. **No hard-coded copy.** All user-visible strings come from props or a future i18n layer.
7. **No business logic in `ui/`.** Primitives must be reusable in any project.

See `docs/COMPONENTS.md` for layer details and the conventions for adding a new component.
