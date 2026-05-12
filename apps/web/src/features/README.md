# Features

**Feature-first organisation.** Each feature folder is a self-contained slice of the product — components, hooks, and feature-local utilities live together.

```
features/
├── agents/           ← agent entity components: AgentIconWrap, AgentBadge, StatusRing, TypingIndicator
├── office-floor/     ← OfficeFloor, MeetingRoom, EmptyDeskSlot, DeskCard
├── chat/             ← ChatPanel, MessageThread, MessageInput, ChatBubble
├── deliverables/     ← DeliverableCard, DeliverablePanel, ExportBar
├── tasks/            ← TaskBoard, TaskCard, TaskList
├── standups/         ← StandupCard, StandupSummaryView
└── projects/         ← ProjectCard, ProjectSwitcher
```

## Each feature has up to four subfolders

```
features/<name>/
├── components/        ← React components for this feature
├── hooks/             ← React hooks scoped to this feature  (create when needed)
├── lib/               ← pure utilities, types, server actions  (create when needed)
└── README.md          ← what this feature is and what lives here
```

Don't pre-create empty `hooks/` or `lib/` folders. Add them when you have a real file to put inside.

## Rules

1. **A feature does not import from another feature directly.** If two features need the same component, promote it: either to `components/ui/` (true primitive) or to a shared lower layer (`@/lib/...`). Cross-feature imports cause cyclic-coupling pain.
2. **Foundational data lives in `lib/`, not in features.** The agent registry (`lib/agents/registry.ts`) is consumed by every feature — that's why it sits in `lib/`, not `features/agents/`.
3. **Route-only components stay in the route folder.** If a component is only used by one page and won't be reused, put it in `app/<route>/_components/Foo.tsx`. Promote to a feature only when reused.
4. **Naming**: `PascalCase.tsx` for components, `useCamelCase.ts` for hooks, `kebab-case.ts` for lib utilities (per `docs/RULES.md`).
5. **No barrel files.** Import from the file directly (`@/features/agents/components/AgentIconWrap`). Barrels hurt tree-shaking and create import-cycle traps.
6. **Disambiguating cross-feature concepts**: when a component could belong to multiple features, put it in the feature whose *concept* it expresses. `TypingIndicator` is conceptually about an agent typing → `features/agents/`. `ChatBubble` is conceptually about messaging → `features/chat/`.

## When to add a new feature

Add a top-level `features/<x>/` when:

- It has at least 2 components OR
- It will have its own data model + UI (e.g. `features/integrations/` once we wire GitHub/Figma)

Otherwise, put one-off components in the route folder or under an existing feature.

See [docs/COMPONENTS.md](../../../../docs/COMPONENTS.md) for the full conventions.
