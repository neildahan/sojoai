# components/ui

**Primitives.** Button, Badge, Input, Textarea, Avatar, etc.

These should be reusable in any project — no Sojo AI-specific business logic, no agent concepts. shadcn/ui-style: each primitive is owned by us (not imported from a node_module), so we can adapt to the design tokens directly.

## Conventions

- One component per file, named `PascalCase.tsx`.
- Use `cn()` from `@/lib/utils` to merge `className` props (clsx + tailwind-merge).
- Variants via [`class-variance-authority`](https://cva.style/) where the variant matrix is non-trivial.
- Forward refs and props (`...rest`).
- No `'use client'` unless the primitive needs interactivity (Button, Input, Toggle).
