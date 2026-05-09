import type { AgentDefinition } from '@/lib/agents/registry';
import type { TaskType } from '@/lib/ai/router';

/**
 * The system prompt for every agent is composed of three layers, in order:
 *   1. Persona       — who the agent is and how they communicate.
 *   2. ProjectBrain  — the shared memory all agents read from.
 *   3. Task          — what the agent is being asked to do right now.
 *
 * Agent-to-agent "conversations" are an illusion: they all read from the same
 * ProjectContext, then the orchestrator runs sequential calls and routes the
 * outputs back into the brain.
 */

export interface ProjectContext {
  projectId: string;
  name: string;
  description: string;
  techStack?: Record<string, string>;
  prdMarkdown?: string;
  /** Compact summary of what the team has shipped so far. */
  recentDeliverables?: Array<{ agentId: string; title: string; summary: string }>;
  /** GitHub / Figma snapshot, if integrations are connected. */
  repoSummary?: string;
  figmaSummary?: string;
  /** Current task assigned to the agent (from the Task model). */
  currentTask?: { title: string; description: string };
}

export function buildSystemPrompt(args: {
  agent: AgentDefinition;
  project: ProjectContext;
  taskType: TaskType;
}): string {
  const { agent, project, taskType } = args;
  return [persona(agent), projectBrain(project), taskInstruction(taskType)]
    .filter(Boolean)
    .join('\n\n---\n\n');
}

function persona(agent: AgentDefinition): string {
  return [
    `You are ${agent.name}, the ${agent.role} at Sojo AI.`,
    `Personality: ${agent.personality.join(', ')}.`,
    'Write like a real colleague — direct, warm, no corporate fluff.',
    `Your name is rendered in italic display type in the UI; use first person ("I think…", not "${agent.name} thinks…").`,
  ].join(' ');
}

function projectBrain(p: ProjectContext): string {
  const parts: string[] = [
    `# Project context`,
    `Name: ${p.name}`,
    `Description: ${p.description}`,
  ];
  if (p.techStack) parts.push(`Tech stack: ${JSON.stringify(p.techStack)}`);
  if (p.prdMarkdown) parts.push(`PRD (latest):\n${p.prdMarkdown}`);
  if (p.recentDeliverables?.length) {
    parts.push(
      `Recent deliverables:\n` +
        p.recentDeliverables.map((d) => `- [${d.agentId}] ${d.title} — ${d.summary}`).join('\n'),
    );
  }
  if (p.repoSummary) parts.push(`Repo summary:\n${p.repoSummary}`);
  if (p.figmaSummary) parts.push(`Figma summary:\n${p.figmaSummary}`);
  if (p.currentTask) {
    parts.push(`Your current task: ${p.currentTask.title}\n${p.currentTask.description}`);
  }
  return parts.join('\n');
}

function taskInstruction(taskType: TaskType): string {
  switch (taskType) {
    case 'chat':
      return 'Respond conversationally in the chat. Keep it short unless the user asks for depth.';
    case 'standup-summary':
      return 'Produce a 1-3 line standup update in your voice: progress, blockers, next.';
    case 'social-post':
      return 'Write a short social post in your voice. Punchy, scannable, no hashtags unless asked.';
    case 'devops-config':
      return 'Output a config file (Dockerfile, CI yaml, etc.) with a brief explanation above it.';
    case 'qa-summary':
      return 'Produce a concise test plan or QA summary as a Markdown checklist.';
    case 'full-prd':
      return 'Produce a complete, well-structured PRD in Markdown. Include: problem, goals, non-goals, users, user stories, scope, milestones, open questions.';
    case 'architecture-decision':
      return 'Produce an Architecture Decision Record (ADR) in Markdown: context, decision, alternatives considered, consequences.';
    case 'security-audit':
      return 'Produce a security audit report in Markdown: findings (severity), evidence, recommended fixes, residual risk.';
  }
}
