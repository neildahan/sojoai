# A-Team — Complete Project Plan
## Handoff Document for Claude Code

---

## What is A-Team?

A-Team is a SaaS web application that gives any user — entrepreneur, freelancer, or startup team — a virtual AI-powered team of specialists they can hire, talk to, and collaborate with. Each team member is an AI agent with a distinct name, role, personality, and area of expertise. Agents talk to each other, produce real deliverables, run daily standups, and feel like actual colleagues — not chatbots.

The core value proposition: a non-technical founder can open A-Team, describe their idea, hire a Product Manager, get a professional PRD, hire a Designer who reads that PRD, hire a Developer who reads both — and ship a real product, guided by a full AI team, without hiring a single human.

---

## Design Assets (already created)

Three HTML design system files were produced during planning. Use these as the visual reference for all UI work in Claude Code:

- **`ateam-design-system.html`** — v1: initial color palette, spacing, typography, component library
- **`ateam-design-system-v2.html`** — v2: full redesign with Fraunces + Plus Jakarta Sans fonts, warm neutral palette, the Office Floor component, dark sidebar, agent desk cards, chat bubbles, standup cards, deliverable cards, project cards, toasts, wizard steps. **This is the primary design reference.**
- **`ateam-design-system-v3.html`** — v3: same as v2 but with Lucide SVG icons inlined (replacing all emojis). Note: the CDN version failed in claude.ai; icons were being inlined. Use v2 as the visual reference and implement Lucide icons via `lucide-react` in the React codebase (npm package, not CDN).

### Design Tokens (locked)

```
Fonts:
  Display / Agent names: Fraunces (Google Fonts) — italic for emphasis
  UI / Body: Plus Jakarta Sans (Google Fonts)
  Code / Metadata: JetBrains Mono (Google Fonts)

Colors:
  Primary:        #4F46E5  (Indigo 600)
  Primary light:  #818CF8  (Indigo 400)
  Primary dim:    #EEF0FF  (Indigo 50)
  Page bg:        #F5F4F0  (warm off-white, NOT cold gray)
  Card bg:        #FFFFFF
  Sidebar bg:     #1A1814  (warm dark, NOT pure black)
  Text primary:   #28251F  (Warm 800)
  Text secondary: #78746A  (Warm 500)
  Border:         #E8E6E0  (Warm 200)

Status colors:
  Active:   #22C55E  (green)
  Waiting:  #F59E0B  (amber)
  Blocked:  #EF4444  (red)
  In convo: #818CF8  (indigo/purple, pulses)
  Idle:     #D4D0C8  (warm gray)

Border radius:
  Inputs/buttons: 10px
  Cards/desks:    14px
  Modals/panels:  16px
  Badges/pills:   9999px

Shadows:
  Desk:  0 2px 8px rgba(26,24,20,0.06)
  Card:  0 4px 16px rgba(26,24,20,0.07)
  Float: 0 12px 40px rgba(26,24,20,0.12)
  Glow:  0 0 0 3px rgba(99,102,241,0.15)  ← focus/active rings

Spacing: strict 4/8px scale
```

### Icons
Use **`lucide-react`** (MIT licensed). Install via npm. Key icon-to-agent mapping:
- Jamie (Scrum Master) → `Compass`
- Sarah (PM) → `ClipboardList`
- Alex (Designer) → `PenTool`
- Lena (Frontend) → `Monitor`
- Marcus (Backend) → `Server`
- Nina (QA) → `Bug`
- Ryan (Security) → `Shield`
- David (DevOps) → `Cloud`
- Mia (Marketing) → `Megaphone`
- Kai (Social Media) → `TrendingUp`

Navigation icons: `LayoutDashboard`, `Users`, `MessageSquare`, `CheckSquare`, `FileText`, `Link2`, `Settings`, `Home`, `Plus`, `Bell`, `Search`, `X`

Status icons: `CheckCircle2`, `AlertTriangle`, `AlertCircle`, `Clock`, `Loader`, `Send`, `Download`, `Eye`, `ArrowRight`, `Zap`, `Calendar`, `GitBranch`, `Figma`

---

## The Agent Roster

| Name | Role | Icon | Bg Color | Personality |
|------|------|------|----------|-------------|
| Jamie | Scrum Master | Compass | #E0E7FF | Organized, diplomatic, runs daily standups |
| Sarah | Product Manager | ClipboardList | #EEF0FF | Strategic, precise, always asks "why" |
| Alex | UI/UX Designer | PenTool | #FEF3C7 | Opinionated, visual, user-obsessed |
| Lena | Frontend Dev | Monitor | #ECFDF5 | Detail-oriented, clean code, a11y focused |
| Marcus | Backend Dev | Server | #F0FDF4 | Pragmatic, thinks about scale and edge cases |
| Nina | QA Engineer | Bug | #FFF7ED | Skeptical, never ships without testing |
| Ryan | Security Expert | Shield | #FEF2F2 | Blunt, flags risks without sugarcoating |
| David | DevOps Engineer | Cloud | #F5F4F0 | Quiet, reliable, speaks in pipelines |
| Mia | Marketing Lead | Megaphone | #FDF4FF | Energetic, brand-obsessed, user-focused |
| Kai | Social Media | TrendingUp | #FFF1F2 | Creative, trend-aware, writes in hooks |

Each agent has a **system prompt** that gives them their personality, expertise, output format, and awareness of shared project context. These need to be written and stored in the codebase.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | Next.js 14+ (App Router) | React-based, API routes built in |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, component library |
| Icons | lucide-react | MIT, tree-shakeable |
| Fonts | next/font with Google Fonts | Fraunces + Plus Jakarta Sans + JetBrains Mono |
| Auth | Clerk or NextAuth.js | OAuth, magic link, session management |
| Database | MongoDB Atlas | Flexible schema for agent outputs |
| ODM | Mongoose | Schema definition and validation |
| AI | Anthropic Claude API | Powers all agents |
| Model routing | Per-agent (see below) | Cost optimization |
| Payments | Stripe | Subscription tiers |
| Integrations | GitHub API, Figma API, Notion API, Google Drive API | OAuth-based |
| Deployment | Vercel | Next.js native, zero config |
| Email | Resend | Daily standup summaries |

### Model Routing (cost optimization — inspired by Ruflo)
Not every agent needs the most powerful model. Route by task complexity:

```
Claude Haiku  → Jamie (Scrum), Nina (QA summaries), David (DevOps configs), Kai (Social)
Claude Sonnet → Sarah (PM/PRD), Alex (Design), Lena (Frontend code), Marcus (Backend code), Ryan (Security), Mia (Marketing)
Claude Opus   → Only for complex reasoning: full PRD generation, architecture decisions, security audits
```

This can reduce token costs 30–50%.

---

## MongoDB Data Models

### User
```js
{
  _id, email, name, avatar,
  plan: 'free' | 'starter' | 'pro' | 'team',
  stripeCustomerId,
  createdAt, updatedAt
}
```

### Project
```js
{
  _id, userId,
  name, description,
  type: 'greenfield' | 'existing',
  status: 'active' | 'archived',
  // integrations
  github: { repoUrl, branch, accessToken },
  figma:  { fileId, accessToken },
  notion: { workspaceId, accessToken },
  // settings
  standupTime: '09:00',
  timezone: 'UTC',
  workingHours: { start: '09:00', end: '18:00' },
  createdAt, updatedAt
}
```

### Team (hired agents per project)
```js
{
  _id, projectId,
  agentId: 'sarah' | 'alex' | 'marcus' | ...,
  status: 'active' | 'waiting' | 'blocked' | 'talking' | 'idle',
  hiredAt,
  currentTask: String,
  progress: Number  // 0-100
}
```

### Conversation
```js
{
  _id, projectId,
  type: 'dm' | 'team' | 'meeting',
  participants: ['sarah', 'alex', 'user'],  // agent IDs + 'user'
  messages: [{
    role: 'user' | 'assistant',
    agentId: String,  // who sent it
    content: String,
    createdAt
  }],
  createdAt, updatedAt
}
```

### Deliverable
```js
{
  _id, projectId, agentId,
  title, type,  // 'prd' | 'wireframes' | 'code' | 'security-report' | 'test-plan' | ...
  content: String,  // Markdown
  status: 'draft' | 'delivered' | 'exported',
  exports: [{ platform: 'google-docs' | 'notion' | 'confluence', url, exportedAt }],
  createdAt, updatedAt
}
```

### ProjectBrain (shared context — the "memory" all agents read from)
```js
{
  _id, projectId,
  // populated progressively as agents work
  projectDescription: String,
  techStack: Object,
  designSystem: Object,
  prd: String,        // latest PRD markdown
  userStories: Array,
  apiSchema: Object,
  dbSchema: Object,
  securityNotes: String,
  deploymentConfig: Object,
  // codebase snapshot (from GitHub integration)
  repoStructure: String,
  keyFiles: Object,   // filename → summary
  dependencies: Object,
  // figma snapshot
  figmaComponents: Array,
  figmaColorTokens: Object,
  updatedAt
}
```

### Task
```js
{
  _id, projectId, agentId,
  title, description,
  status: 'todo' | 'in-progress' | 'done' | 'blocked',
  priority: 'low' | 'medium' | 'high',
  blockedBy: String,  // agentId or description
  createdBy: 'user' | agentId,
  createdAt, updatedAt
}
```

### StandupSummary
```js
{
  _id, projectId,
  date,
  agentReports: [{ agentId, update, status, blocker }],
  summary: String,  // compiled by Jamie
  sentAt
}
```

---

## Application Screens & Routes

```
/                           → Landing page (public)
/pricing                    → Pricing page (public)
/login                      → Auth (Clerk/NextAuth)

/app                        → Redirects to /app/home
/app/home                   → All Projects — home screen
/app/onboarding             → Wizard (first login only, redirects after)
  /app/onboarding/start     → Step 1: fresh vs existing
  /app/onboarding/describe  → Step 2: describe the project
  /app/onboarding/needs     → Step 3: what do you need
  /app/onboarding/connect   → Step 3b (existing): connect GitHub/Figma
  /app/onboarding/meet      → Step 4: meet first recommended agent

/app/[projectId]                        → Project root (redirects to team-room)
/app/[projectId]/team-room              → Team Room — office floor, agent desks, team feed
/app/[projectId]/messages               → All conversations list
/app/[projectId]/messages/[agentId]     → DM with specific agent
/app/[projectId]/messages/general       → Team feed (#general)
/app/[projectId]/messages/meeting       → Start / view meeting
/app/[projectId]/tasks                  → Master task board (all agents)
/app/[projectId]/tasks/[agentId]        → Per-agent task board
/app/[projectId]/deliverables           → All deliverables + export
/app/[projectId]/integrations           → Connect GitHub, Figma, Notion, etc.
/app/[projectId]/settings               → Project settings, standup time, working hours
/app/[projectId]/hire                   → Hiring room — browse & hire agents

/app/settings                           → User account settings
/app/settings/billing                   → Stripe billing portal
/app/settings/notifications             → Notification preferences
```

---

## Page-by-Page UX Spec

### `/app/home` — All Projects

The first screen after login (post-onboarding). Shows all projects as cards.

**Layout:** Top bar (logo + notifications bell + user avatar) + main content area (no sidebar — this is the workspace level, not project level)

**Content:**
- Greeting: "Good morning, [name]" with current date
- Grid of project cards (see design system v2 for card design)
- Each card: project name, description, agent avatars (stacked), open task count, blocker count (highlighted red if any), last activity timestamp, "Open" button
- Empty state: "You haven't created any projects yet" + "Start your first project" CTA
- "+ New Project" button in top right

**Project card states:**
- Active (green dot)
- Has blocker (red border + blocker count badge)
- Archived (faded, "Restore" action)

---

### `/app/onboarding/*` — Wizard

First login only. Full-screen, no sidebar, no navbar — complete focus.

**Step 1 — Start:**
- Two large cards: "Start fresh — I have an idea" / "Existing project — I already have code"
- Selecting one routes to different Step 2 paths

**Step 2a (Fresh) — Describe:**
- "What's your project called?" input
- "Describe it in plain language" textarea
- Helper: "Don't worry about being technical. Just describe it like you'd explain to a friend."

**Step 2b (Existing) — Connect:**
- Connect cards: GitHub/Bitbucket, Figma, Notion/Confluence, Jira/Linear
- OAuth flow for each
- After connecting: show "Here's what we found" summary (repo structure, Figma components detected, etc.)
- Still ask: "What feature do you want to add?"

**Step 3 — What do you need:**
- Multi-select cards (see design system v2 wizard section)
- Options: I need a plan / I need design / I need dev / I need security / I need marketing / I need a manager
- User can select multiple

**Step 4 — Meet your first agent:**
- Based on selections, recommend one agent (almost always Sarah/PM first)
- Agent card animates in: icon wrap, name, role, "what I'll do for your project"
- CTA: "Hire Sarah — let's start"

---

### `/app/[projectId]/team-room` — The Office Floor

**The heart of the app.** See design system v2 for the Office Floor component.

**Layout:**
- Left sidebar (240px, dark `#1A1814`) — always visible inside a project
- Main content area

**Sidebar contents:**
- Logo + app name at top
- Project name as section label
- Nav items: Team Room (active), Messages (with badge), Tasks (with count), Deliverables, Integrations
- Divider
- All Projects, Settings at bottom
- Project switcher: clicking project name opens a dropdown with all projects + "New project"

**Main content:**
- Page title: project name in Fraunces
- Office Floor grid (see design system v2)
- Each hired agent has a desk card showing: icon wrap + name + role, status dot + badge, current task (italic), progress bar, percentage, "Message" button
- Agents in conversation together share a "Meeting Room" spanning 2 columns, with dashed green border and pulse animation
- Unhired agent slots show as "+" cards with "Hire from Hiring Room" link
- Below the floor: Team Feed (live #general channel — see Messages spec)
- Top right: "Start Meeting" button, "Hire someone new" button

**Status ring animations:**
- Active: green static ring
- In convo: indigo ring with `glow-ring` keyframe animation (pulses)
- Waiting: amber static ring
- Blocked: red static ring
- Idle: gray static ring

---

### `/app/[projectId]/messages/[agentId]` — Agent DM

**Layout:** Two-column — Chat (65%) + Deliverables panel (35%)

**Chat area:**
- Agent header: icon wrap + name (Fraunces) + status + "View Deliverables" button
- Message thread (see design system v2 chat component)
- Agent messages: warm gray bubble, `0 rmd rmd rmd` border-radius
- User messages: dark (`#1A1814`) bubble, `rmd 0 rmd rmd` border-radius, right-aligned
- Typing indicator: three bouncing dots (see design system CSS)
- Input: textarea with `⌘↵ to send` hint + Send button (icon only)
- On first open: agent sends a greeting automatically and asks their first question

**Deliverables panel:**
- Label: "Deliverables from [name]"
- Cards for each output: icon wrap, title, type badge, date, Export button + View button
- Export options: Google Docs, Notion, Confluence, Download MD, Download PDF
- "Shared with team" badge showing which other agents can read this deliverable
- Empty state: "No deliverables yet — start chatting with [name]"

---

### `/app/[projectId]/messages/general` — Team Feed

Live feed of all agent-to-agent conversations. The user can read and join.

**Layout:** Full width, chat-like, chronological

**Message format:**
- Agent icon wrap (small, 30px) + agent name (bold) + timestamp
- Message content
- If message is from user: right-aligned, dark bubble
- If agent-to-agent: show both agents, slightly indented, with a "connecting" visual

**Features:**
- Jump to conversation: click any agent's name → opens their DM
- `@all` in the input triggers a team meeting
- Filter by agent (dropdown)
- Search messages

---

### `/app/[projectId]/messages/meeting` — Team Meeting / Standup

**Two modes:**

1. **Manual meeting:** User clicks "Start Meeting" → all agents respond in sequence with their current status. User can ask questions, agents respond in character.

2. **Automated daily:** Jamie triggers at the configured standup time, compiles a summary from all agents' task states, sends to user. See design system v2 standup card for the UI.

**Standup card per agent:** icon wrap, name + role, today's update (generated from their tasks), status tag (On track / In discussion / Blocked).

---

### `/app/[projectId]/hire` — Hiring Room

**Layout:** Top filter tabs (All / Strategy / Design / Engineering / Growth) + agent card grid

**Agent card (browse state):**
- Icon wrap (large, 48px)
- Name (Fraunces, 20px) + role
- 1-line description of what they do
- "Works best with" list (other agents)
- Input/output tags
- "Hire" button (primary) — disabled with "Already on your team" if hired
- Click card → expanded detail modal

**Agent detail modal:**
- Full description, example deliverables, recommended order
- "Hire [Name]" CTA
- "What [Name] needs from you" — so user knows what to expect

---

### `/app/[projectId]/tasks` — Master Task Board

**Layout:** Filter bar + kanban or list view toggle

**Filters:** Agent (multi-select), Status (Todo/In Progress/Done/Blocked), Priority, Sprint

**List view (default):**
Each row: agent icon (small) + agent name, task title, status badge, priority dot, created date, actions (view, reassign)

**Per-agent board** (`/tasks/[agentId]`):
Mini kanban: Todo | In Progress | Done — cards with task title, description snippet, status

**Task creation:**
- User can add tasks manually
- Agents create tasks automatically from their work
- Jamie assigns and prioritizes

---

### `/app/[projectId]/deliverables` — Project Brain

Everything the team has produced in one place.

**Layout:** Left sidebar (grouped by agent) + main reading area

**Left sidebar:**
Collapsible groups per agent, each showing their deliverable count. Clicking a deliverable opens it in the main area.

**Main area:**
Selected deliverable rendered as rich Markdown. Title, agent name, date, status badge at top. Export bar below header (Google Docs, Notion, Confluence, Download).

**"All Deliverables" tab:**
Timeline view — chronological list of all outputs across all agents.

---

### `/app/[projectId]/integrations` — Connect Your Stack

**Cards for each integration:**
- GitHub / Bitbucket / GitLab: connect → select repo → select branch → "What we found" summary
- Figma: connect → select file → "X components and Y color styles detected"
- Notion: connect → select workspace
- Confluence: connect → select space
- Jira / Linear: connect → select project

**After connection:** show a summary card of what was fetched — this builds trust that agents are actually reading the existing work.

**Disconnect:** always available. Disconnecting removes context from agent prompts.

---

## Agent System Prompt Architecture

Each agent has a system prompt composed of three parts:

**1. Personality & Role (static)**
```
You are [Name], the [Role] at A-Team. You are [personality traits].
Your expertise: [specific skills].
Your communication style: [how they write].
```

**2. Project Context (injected per request)**
```
Current project: [name] — [description]
Tech stack: [from ProjectBrain]
What the team has done so far: [summary of deliverables]
Your current task: [from Task model]
```

**3. Codebase/Design Context (injected if integrations connected)**
```
GitHub repo: [repoUrl]
Repo structure: [repoStructure]
Key dependencies: [dependencies]
Figma components: [figmaComponents]
```

**Agent-to-agent handoffs:**
When Sarah delivers the PRD, it goes into `ProjectBrain.prd`. When Alex is next invoked, his prompt includes Sarah's PRD automatically. This creates the illusion of agents talking — they're actually all reading from the same shared brain.

**Visible agent conversations:**
When two agents need to "discuss" something (e.g. Alex and Marcus on CSP), trigger two sequential API calls and display both responses in the Team Feed as a conversation. Store in a `Conversation` document with both agent IDs as participants.

---

## Agent-to-Agent Conversation Flow

```
User triggers action (hires new agent, asks a question, or automated trigger)
  ↓
Backend determines which agents need to communicate
  ↓
Agent A prompt built (personality + project brain + task context)
  ↓
Claude API call (Haiku or Sonnet based on task)
  ↓
Response stored in Conversation document, ProjectBrain updated
  ↓
Agent B prompt built (same context + Agent A's response)
  ↓
Claude API call
  ↓
Both responses streamed to Team Feed in real time (SSE or WebSocket)
  ↓
User sees the conversation appearing live
```

**Streaming:** Use Server-Sent Events (SSE) via a Next.js API route to stream agent responses to the client in real time. This makes the typing indicator feel live.

---

## API Routes (Next.js)

```
POST /api/projects                  → create project
GET  /api/projects                  → list user's projects
GET  /api/projects/[id]             → get project + team + brain
PUT  /api/projects/[id]             → update project settings

POST /api/projects/[id]/agents/hire → hire an agent
GET  /api/projects/[id]/agents      → list hired agents + status

POST /api/projects/[id]/chat/[agentId]   → send message to agent (streams response)
GET  /api/projects/[id]/chat/[agentId]   → get conversation history
GET  /api/projects/[id]/chat/general     → get team feed

GET  /api/projects/[id]/tasks            → list all tasks
POST /api/projects/[id]/tasks            → create task
PUT  /api/projects/[id]/tasks/[taskId]   → update task status

GET  /api/projects/[id]/deliverables     → list deliverables
POST /api/projects/[id]/deliverables/export → export to platform

POST /api/projects/[id]/standup          → trigger manual standup
GET  /api/projects/[id]/standup/history  → past standup summaries

POST /api/integrations/github/connect   → OAuth + fetch repo context
POST /api/integrations/figma/connect    → OAuth + fetch file context
POST /api/integrations/github/disconnect

POST /api/webhooks/stripe               → handle billing events
```

---

## Multi-Project Architecture Notes

- Every piece of data (Team, Conversations, Tasks, Deliverables, Brain, Integrations) is scoped to a `projectId`
- Users can have unlimited projects (subject to plan limits)
- Project switcher in sidebar always visible when inside a project
- Home screen (`/app/home`) is the cross-project view
- Each project has completely independent agents — Sarah on Project A has no memory of Project B
- Daily standups are per-project; users receive a digest email aggregating all projects

---

## Existing vs New Project — Key Difference

**New project:**
- ProjectBrain starts empty
- Agents work from the user's description only
- PM (Sarah) is always recommended first

**Existing project:**
- After GitHub connect: backend fetches repo structure, README, package.json, key config files
- After Figma connect: fetches component names, color styles, text styles
- These are summarized (not full files — token budget) and injected into ProjectBrain
- Agents are shown an "Impact Analysis" before starting: what they found, any immediate flags
- Security agent (Ryan) may immediately flag issues found in existing code
- Designer (Alex) matches existing Figma design system instead of inventing one

**Context fetching strategy (token efficient):**
```
PM Agent:       README, open GitHub issues, milestone names
Frontend Dev:   /src folder structure, package.json, key component files (top 5 by size)
Backend Dev:    /api or /server folder, DB schema files, package.json
Security:       All dependencies (package.json), auth-related files, .env.example (keys redacted)
QA:             Existing test files, CI config
DevOps:         Dockerfile, CI/CD config, deployment scripts
Designer:       Figma component names, color tokens, text styles (no frames — too large)
```

---

## Notification System

**In-app (top bar bell):**
- Agent delivered a deliverable
- Agent flagged a blocker
- Daily standup summary ready
- Agent needs your input (waiting status)

**Email (via Resend):**
- Daily morning digest: all projects, all agents, status + blockers
- Each project section links directly to the project
- Time sent = standup time configured per project

**Future (not MVP):**
- Slack integration
- WhatsApp
- Push notifications (mobile PWA)

---

## Pricing Tiers (suggested)

| Tier | Price | Projects | Agents | Messages/mo |
|------|-------|----------|--------|-------------|
| Free | $0 | 1 | 2 | 100 |
| Starter | $19/mo | 3 | 5 | 1,000 |
| Pro | $49/mo | 10 | All 10 | 5,000 |
| Team | $99/mo | Unlimited | All 10 | Unlimited |

Stripe handles billing. Metered usage tracked in MongoDB. Enforce limits in API middleware.

---

## Build Order (recommended for Claude Code)

**Phase 1 — Foundation**
1. Next.js project setup (App Router, TypeScript, Tailwind, shadcn/ui, lucide-react, Fraunces + Plus Jakarta fonts)
2. MongoDB connection (Mongoose models: User, Project, Team, Conversation, Deliverable, Task, ProjectBrain, StandupSummary)
3. Auth (Clerk — fastest to set up with Next.js)
4. Basic layout components: sidebar, topbar, page wrapper

**Phase 2 — Design System Implementation**
5. Implement all tokens from `ateam-design-system-v2.html` as Tailwind config + CSS variables
6. Build all reusable components: AgentIconWrap, DeskCard, Badge, Button variants, ChatBubble, Toast, DeliverableCard, ProjectCard, StandupCard, WizardStep
7. Implement the Office Floor layout component

**Phase 3 — Core Flows**
8. Home screen (`/app/home`) — project cards, empty state
9. Onboarding wizard — 4 steps, both fresh and existing paths
10. Hiring Room — agent catalog, hire flow
11. Team Room — office floor with real agent status
12. Agent DM — chat interface with streaming responses
13. Deliverables panel

**Phase 4 — AI Integration**
14. Claude API integration — agent system prompts, model routing
15. Streaming (SSE) for real-time chat
16. ProjectBrain — shared context injection into all prompts
17. Agent-to-agent conversations — sequential calls, Team Feed display

**Phase 5 — Tasks, Standups, Integrations**
18. Task system — creation, assignment, board views
19. Daily standup — automated trigger (cron), summary generation, email via Resend
20. GitHub OAuth + context fetching
21. Figma OAuth + component fetching
22. Export to Google Docs / Notion

**Phase 6 — Billing & Polish**
23. Stripe integration — plans, usage limits
24. Notifications system
25. Multi-project switching
26. Mobile responsive adjustments
27. Error states, empty states, loading skeletons throughout

---

## Key Design Decisions to Preserve

1. **Fraunces for agent names everywhere** — it gives them personality and makes them feel like real people, not software labels
2. **Warm neutrals, not cold grays** — `#F5F4F0` page background, `#1A1814` sidebar. The warmth is intentional.
3. **The Office Floor is the signature component** — do not reduce it to a simple list or card grid. The spatial metaphor (desks, meeting rooms, status rings) is what makes A-Team memorable.
4. **Meeting Room** — agents in conversation share a dashed-border meeting room spanning 2 columns, with a pulse animation. This must be implemented.
5. **One dark sidebar, everything else light** — the sidebar contrast grounds the layout.
6. **Deliverables panel is always visible** in DM view — not hidden, not a tab. Outputs are first-class.
7. **Agents initiate** — on first open, agents send a greeting. They ping you when blocked. Jamie sends the daily. This is not optional — it's core to the product feeling alive.
8. **Typing indicator** — always show when agent is generating. Never a blank wait.
9. **Status ring animations** — the `glow-ring` keyframe on active/in-convo status is subtle but makes the office floor feel live.

---

## Files Reference

| File | Description |
|------|-------------|
| `ateam-design-system.html` | v1 design system — initial colors, components |
| `ateam-design-system-v2.html` | **v2 design system — primary reference for all UI** |
| `ateam-design-system-v3.html` | v3 — same as v2 with inline SVG icons (partial) |
| `ui-ux-pro.skill` | Claude skill for UX guidance — install in Claude Code settings |

Use `ateam-design-system-v2.html` as the definitive visual reference. Open it in a browser alongside Claude Code and pixel-match against it.

---

*Document prepared in claude.ai — continue in Claude Code.*
