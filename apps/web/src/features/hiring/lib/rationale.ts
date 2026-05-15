import type { AgentId } from '@/lib/agents/registry';

/**
 * One-line "why hire this agent" copy shown on suggested-next-hire cards.
 * Focuses on WHEN in the project lifecycle they create value — not just
 * what their role is. The Hiring Room reuses this when it has space.
 */
export const HIRE_RATIONALE: Record<AgentId, string> = {
  jamie:
    "Coordinates the team and runs daily standups. Joins every project automatically.",
  sarah:
    "Scopes the project and leads it — PRD, milestones, priorities. Almost always the right first hire.",
  alex:
    "Hire after the PRD is in shape. Alex turns the plan into wireframes, screens, and a design system.",
  lena:
    "Hire when the UI starts taking shape. Lena builds the screens people see and tap.",
  marcus:
    "Hire when the product needs data, APIs, or integrations. Marcus designs the schema and ships the endpoints.",
  nina:
    "Hire when you have something to test. Nina writes test plans and catches regressions before each ship.",
  ryan:
    "Hire before launch (or earlier if security is core). Ryan audits for risks and writes a hardening plan.",
  david:
    "Hire when shipping reliably starts to matter. David sets up pipelines, deploys, and monitoring.",
  mia:
    "Hire when you're ready to start telling the world. Mia owns positioning, launch plan, and landing copy.",
  kai:
    "Hire when you're ready for social. Kai writes posts, threads, and launch announcements.",
};
