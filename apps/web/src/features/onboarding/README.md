# features/onboarding

The 4-step onboarding wizard (start → describe/connect → needs → meet).

## Components

- `WizardStepIndicator` — "Step n of N" with dotted progress
- `ChoiceCard` — large clickable card for single-select navigation (used in Step 1)
- `NeedToggleCard` — toggleable card for multi-select (used in Step 3)

## Flow

```
/app/onboarding/start
    │
    ├─[fresh]──▶ /app/onboarding/describe ──▶ /app/onboarding/needs ──▶ /app/onboarding/meet ──▶ Hire & go to project
    │
    └─[existing]▶ /app/onboarding/connect  ──▶ /app/onboarding/needs ──▶ /app/onboarding/meet ──▶ Hire & go to project
```

## State

State accumulates in URL search params: `?type=fresh&name=…&desc=…&need=plan&need=design`. URL params are share-able, refresh-safe, and obvious to debug. When the real "create project" lands (Mongo wiring), the meet-step Hire action will write the project + first Team entry to the DB and redirect to `/app/<newProjectId>/team-room`.

Until then, the Hire CTA routes to `/app/demo/team-room`.

## Imports

- Reads from `@/lib/agents/registry` for the recommendation in Step 4
- Uses `@/components/ui/*` primitives
- Does NOT import from other features
