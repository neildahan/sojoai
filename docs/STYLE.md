# Style Guide

> Visual reference: `sojoai-design-system-v3.html` (open in a browser and pixel-match).
> All tokens live in `apps/web/src/app/globals.css` as Tailwind 4 `@theme` blocks.

---

## Principles

1. **Warm, not cold.** Page background is `#F5F4F0`, sidebar is `#1A1814`. Never pure white, never pure gray.
2. **Indigo means something.** Use it sparingly — interactive accents, focus rings, the meeting-room pulse. Decorative usage dilutes its meaning.
3. **Spatial metaphor.** The Office Floor (desks, meeting room) is the signature UI. Don't reduce it to a card grid.
4. **Fraunces for personality.** Agent names, page titles, and emphasis use Fraunces (italic where shown in the design system). Body uses Plus Jakarta Sans.

---

## Tokens (canonical)

### Color — Indigo
| Token | Hex |
|---|---|
| `indigo-50` | `#EEF0FF` |
| `indigo-100` | `#E0E3FF` |
| `indigo-200` | `#C4CAFF` |
| `indigo-400` | `#818CF8` |
| `indigo-500` | `#6366F1` |
| `indigo-600` | `#4F46E5` |
| `indigo-700` | `#4338CA` |
| `indigo-900` | `#312E81` |

### Color — Warm neutrals
| Token | Hex |
|---|---|
| `warm-50` | `#FAFAF9` |
| `warm-100` | `#F5F4F0` |
| `warm-200` | `#E8E6E0` |
| `warm-300` | `#D4D0C8` |
| `warm-400` | `#9E9A90` |
| `warm-500` | `#78746A` |
| `warm-600` | `#57534A` |
| `warm-700` | `#3D3A33` |
| `warm-800` | `#28251F` |
| `warm-900` | `#1A1814` |

### Color — Surface
| Token | Hex | Usage |
|---|---|---|
| `surface-page` | `#F5F4F0` | page background |
| `surface-card` | `#FEFEFE` | cards |
| `surface-raised` | `#FFFFFF` | floating elements |
| `surface-sidebar` | `#1A1814` | dark sidebar |

### Color — Status
| Token | Hex | Meaning |
|---|---|---|
| `status-active` | `#22C55E` | green: active |
| `status-busy` | `#F59E0B` | amber: waiting / busy |
| `status-blocked` | `#EF4444` | red: blocker |
| `status-talking` | `#818CF8` | indigo: in conversation (pulses) |
| `status-idle` | `#D4D0C8` | gray: idle |

### Color — Office floor
`desk-active` `#F0F4FF`, `desk-busy` `#FFF8F0`, `desk-away` `#F5F4F0`, `meeting-room` `#F0FFF4`.

### Typography
| Token | Family | Use |
|---|---|---|
| `font-display` | Fraunces (Google) | agent names, page titles, emphasis (italic) |
| `font-sans` | Plus Jakarta Sans (Google) | body, UI |
| `font-mono` | JetBrains Mono (Google) | code, metadata, timestamps |

### Spacing
Strict 4 / 8 px scale. Use Tailwind's default `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px).

### Radius
| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | small badges, mini buttons |
| `radius-md` | 10px | inputs, buttons |
| `radius-desk` | 14px | desk cards (signature) |
| `radius-lg` | 16px | cards, panels |
| `radius-xl` | 24px | modals |
| `radius-full` | 9999px | pills |

### Shadows
| Token | Use |
|---|---|
| `shadow-desk` | resting desk card |
| `shadow-card` | hover, elevated card |
| `shadow-float` | modals, floating panels |
| `shadow-glow` | focus / active ring |
| `shadow-active-desk` | the agent currently in conversation |

### Animations
- `animate-glow-ring` — agents in conversation (indigo pulse)
- `animate-pulse-soft` — typing indicator dots
- `animate-bounce-dot` — "agent is typing"
- `animate-fade-up` — section entrances

All animations respect `prefers-reduced-motion: reduce`.

---

## Agent icon backgrounds

Each agent has a pastel wash for their icon tile. **Single source of truth: `lib/agents/registry.ts`.** Don't hard-code these in components — read from the registry.

| Agent | Bg |
|---|---|
| Jamie | `#E0E7FF` |
| Sarah | `#EEF0FF` |
| Alex | `#FEF3C7` |
| Lena | `#ECFDF5` |
| Marcus | `#F0FDF4` |
| Nina | `#FFF7ED` |
| Ryan | `#FEF2F2` |
| David | `#F5F4F0` |
| Mia | `#FDF4FF` |
| Kai | `#FFF1F2` |

---

## Don'ts

- Don't introduce a new color without adding it to `globals.css` `@theme`.
- Don't use cold gray (`zinc-*`, `slate-*`). Always warm.
- Don't decorate with indigo — reserve it for meaning.
- Don't ship raw inline SVGs from the design system HTML. Use `lucide-react`.
- Don't use emojis in product UI; we replaced them with Lucide icons.
