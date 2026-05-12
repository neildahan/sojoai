# Components

> Sojo AI uses **feature-first organisation**. Domain components live next to the rest of their feature; only project-agnostic primitives and the app shell live in `components/`.

---

## The structure

```
src/
├── components/
│   ├── ui/                ← shadcn-style primitives (Button, Input, Dialog, Toast, …)
│   └── layout/            ← Sidebar, TopBar, PageWrapper, Breadcrumb
├── features/              ← THE main folder
│   ├── agents/
│   │   ├── components/    ← AgentIconWrap, AgentBadge, StatusRing, TypingIndicator
│   │   ├── hooks/         ← useAgentStatus … (created when needed)
│   │   ├── lib/           ← feature-local utilities … (created when needed)
│   │   └── README.md
│   ├── office-floor/      ← OfficeFloor, MeetingRoom, EmptyDeskSlot, DeskCard
│   ├── chat/              ← ChatPanel, MessageThread, ChatBubble, MessageInput
│   ├── deliverables/
│   ├── tasks/
│   ├── standups/
│   └── projects/
└── lib/                   ← shared infrastructure (registry, db, ai router, env, utils)
```

Route-only components (used by exactly one page) stay in the route folder under `_components/`.

---

## Where does my component go?

| Question | Answer |
|---|---|
| Is it a **headless primitive** (Button, Input, Dialog)? | `components/ui/` |
| Is it part of the **app shell** (Sidebar, TopBar)? | `components/layout/` |
| Does it represent a **domain concept** (agent, project, deliverable, …)? | `features/<feature>/components/` |
| Is it used by **only one route** and won't be reused? | `app/<route>/_components/` |

When a component plausibly fits two features, put it in the feature whose **concept** it expresses. `TypingIndicator` represents an agent typing → `features/agents/`. `ChatBubble` represents messaging → `features/chat/`.

---

## Hard rules

1. **A feature does not import from another feature.** If two features need the same component, promote it: to `components/ui/` (true primitive) or to a shared lower layer (`@/lib/...`). Cross-feature imports cause cyclic-coupling pain.
2. **No barrel files.** Import from the file directly: `@/features/agents/components/AgentIconWrap`. Barrels hurt tree-shaking and create cycle traps.
3. **One source of truth per primitive.** Status rings, agent icons, badges, buttons — each has exactly one component. Variants via props/className, never via copy-paste.
4. **Foundational data lives in `lib/`.** The agent registry (`@/lib/agents/registry`) is consumed by every feature — that's why it sits in `lib/`, not `features/agents/`.
5. **Server Components by default.** `'use client'` only when you need state, effects, browser APIs, or event handlers.
6. **Typed props.** Every component takes a typed `Props` interface. Defaults are explicit.
7. **No hard-coded copy.** All user-visible strings come from props (or a future i18n layer).

---

## How to add a component

1. **Decide the location** using the table above.
2. **Search first.** Grep `features/` and `components/` for the concept; extending an existing component beats creating a new one.
3. **Define typed props.**
   ```ts
   interface AgentBadgeProps {
     agentId: AgentId;
     size?: 'sm' | 'md' | 'lg';
     showRole?: boolean;
     className?: string;
   }
   ```
4. **Accept and merge `className`** with `cn()` from `@/lib/utils`.
5. **Read entity data from `@/lib/agents/registry`**, not hard-coded values.
6. **Add it to the feature's README** if the feature lists components there.

---

## Naming

| Kind | Convention | Example |
|---|---|---|
| Component file (feature) | `PascalCase.tsx` | `AgentIconWrap.tsx` |
| Component file (`components/ui/`) | `kebab-case.tsx` (shadcn) | `button.tsx` |
| Hook file | `useCamelCase.ts` | `useAgentStatus.ts` |
| Lib file | `kebab-case.ts` | `format-status.ts` |
| Props interface | `<Component>Props` | `AgentBadgeProps` |

---

## Variants

For 1–2 variants, a `variant` prop with a `switch` is fine. For larger matrices, use [`class-variance-authority`](https://cva.style/):

```ts
const button = cva('inline-flex items-center justify-center rounded-md font-medium', {
  variants: {
    intent: { primary: 'bg-warm-900 text-warm-50', ghost: 'bg-transparent text-warm-800' },
    size:   { sm: 'h-9 px-3 text-sm', md: 'h-11 px-6 text-sm' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

---

## When to add a new feature folder

Add `features/<x>/` when:

- It has at least 2 components, OR
- It will own a data model + UI (e.g. `features/integrations/` once we wire GitHub/Figma)

Otherwise, drop the component into the existing nearest feature, into a route folder under `_components/`, or wait until you have more.

---

## Testing

Components with logic get a co-located `Component.test.tsx` (Vitest + Testing Library). Pure presentational components rely on visual review against `sojoai-design-system-v3.html`.
