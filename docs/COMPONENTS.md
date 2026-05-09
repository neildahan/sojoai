# Components

> See `apps/web/src/components/README.md` for the layer rules. This doc focuses on **conventions for adding a component**.

---

## The five layers

| Layer | Purpose | Imports from |
|---|---|---|
| `ui/` | Headless-ish primitives (Button, Badge, Input). Reusable in any project. | nothing internal |
| `common/` | Cross-cutting reusables (Toast, Modal, EmptyState, ErrorBoundary). | `ui/` |
| `agents/` | Agent entity components (AgentIconWrap, DeskCard, ChatBubble, StandupCard). | `ui/`, `common/` |
| `project/` | Project-scoped composites (ProjectCard, OfficeFloor, TeamFeed). | `ui/`, `common/`, `agents/` |
| `layout/` | App shell (Sidebar, TopBar, PageWrapper). | any of the above |

**Layering rule:** lower layers may not import from higher layers. Treat this as enforced — if a `ui/` primitive needs an agent concept, it doesn't belong in `ui/`.

---

## How to add a component

1. **Decide the layer.** If it touches an agent, it goes in `agents/`. If it's project-level, `project/`. If it's chrome, `layout/`. If it's neither, look at `ui/` vs `common/`.
2. **Search first.** `grep` `components/` for the concept. Extending an existing component is almost always better than creating a new one.
3. **Define props as a typed interface.**
   ```ts
   interface AgentBadgeProps {
     agentId: AgentId;
     size?: 'sm' | 'md' | 'lg';
     showRole?: boolean;
     className?: string;
   }
   ```
4. **Accept and merge `className`** with `cn()` from `@/lib/utils`.
5. **Read entity data from the registry**, not hard-coded values. Agent name/icon/color comes from `lib/agents/registry.ts`.
6. **No hard-coded copy.** All user-visible strings come from props.
7. **`'use client'` only if needed.** Default to a Server Component.
8. **Add an example** here (or in a co-located `*.example.tsx`).

---

## Naming

| Kind | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `AgentIconWrap.tsx` |
| Hook file | `useCamelCase.ts` | `useAgentStatus.ts` |
| Co-located util | `kebab-case.ts` | `format-status.ts` |
| Props interface | `<Component>Props` | `AgentBadgeProps` |

---

## Variants

For 1-2 variants, a `variant` prop with a `switch` is fine. For larger matrices, use [`class-variance-authority`](https://cva.style/):

```ts
const button = cva('inline-flex items-center justify-center rounded-md font-medium', {
  variants: {
    intent: { primary: 'bg-warm-900 text-warm-50', ghost: 'bg-transparent text-warm-800' },
    size: { sm: 'h-9 px-3 text-sm', md: 'h-11 px-6 text-sm' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

---

## Status rings, agent icons, badges — single source of truth

If you find yourself styling a status ring or agent icon outside the entity component for it, **stop**. Add the missing variant to the entity component. Duplicating these defeats the design system.

---

## Testing

Components with logic get a co-located `Component.test.tsx` (Vitest + Testing Library). Pure presentational components rely on visual review against `sojoai-design-system-v3.html`.
