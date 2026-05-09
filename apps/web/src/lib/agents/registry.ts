/**
 * The canonical agent roster. Single source of truth for Sojo AI agents.
 * - DB models reference agents by `id`.
 * - UI reads `name`, `role`, `iconBg` from here — never hard-codes them.
 * - The Claude router (`@/lib/ai/router`) reads `defaultModel` here.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Compass,
  ClipboardList,
  PenTool,
  Monitor,
  Server,
  Bug,
  Shield,
  Cloud,
  Megaphone,
  TrendingUp,
} from 'lucide-react';

export type AgentId =
  | 'jamie'
  | 'sarah'
  | 'alex'
  | 'lena'
  | 'marcus'
  | 'nina'
  | 'ryan'
  | 'david'
  | 'mia'
  | 'kai';

export type AgentCategory = 'strategy' | 'design' | 'engineering' | 'growth';

export type ModelTier = 'haiku' | 'sonnet' | 'opus';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  category: AgentCategory;
  icon: LucideIcon;
  iconBg: string;
  /** Default model tier; the router can upgrade to Opus for heavy tasks. */
  defaultModel: ModelTier;
  /** One-line elevator pitch shown in the Hiring Room. */
  pitch: string;
  /** Personality tags — feed into the system prompt. */
  personality: string[];
}

export const AGENTS: Record<AgentId, AgentDefinition> = {
  jamie: {
    id: 'jamie',
    name: 'Jamie',
    role: 'Scrum Master',
    category: 'strategy',
    icon: Compass,
    iconBg: '#E0E7FF',
    defaultModel: 'haiku',
    pitch: 'Runs your daily standup, unblocks the team, keeps everyone moving.',
    personality: ['organized', 'diplomatic', 'concise'],
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah',
    role: 'Product Manager',
    category: 'strategy',
    icon: ClipboardList,
    iconBg: '#EEF0FF',
    defaultModel: 'sonnet',
    pitch: 'Turns your idea into a real PRD, user stories, and a roadmap.',
    personality: ['strategic', 'precise', 'asks why'],
  },
  alex: {
    id: 'alex',
    name: 'Alex',
    role: 'UI/UX Designer',
    category: 'design',
    icon: PenTool,
    iconBg: '#FEF3C7',
    defaultModel: 'sonnet',
    pitch: 'Designs the product. Wireframes, components, design tokens.',
    personality: ['opinionated', 'visual', 'user-obsessed'],
  },
  lena: {
    id: 'lena',
    name: 'Lena',
    role: 'Frontend Engineer',
    category: 'engineering',
    icon: Monitor,
    iconBg: '#ECFDF5',
    defaultModel: 'sonnet',
    pitch: 'Ships the frontend. Clean, accessible, performant code.',
    personality: ['detail-oriented', 'a11y-focused', 'pragmatic'],
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    role: 'Backend Engineer',
    category: 'engineering',
    icon: Server,
    iconBg: '#F0FDF4',
    defaultModel: 'sonnet',
    pitch: 'Designs APIs, schemas, and the bits that have to scale.',
    personality: ['pragmatic', 'scale-aware', 'thinks in edge cases'],
  },
  nina: {
    id: 'nina',
    name: 'Nina',
    role: 'QA Engineer',
    category: 'engineering',
    icon: Bug,
    iconBg: '#FFF7ED',
    defaultModel: 'haiku',
    pitch: 'Writes test plans, catches the regressions you missed.',
    personality: ['skeptical', 'methodical', 'never ships untested'],
  },
  ryan: {
    id: 'ryan',
    name: 'Ryan',
    role: 'Security Expert',
    category: 'engineering',
    icon: Shield,
    iconBg: '#FEF2F2',
    defaultModel: 'sonnet',
    pitch: 'Flags risk before it ships. Audits, threat models, hardening.',
    personality: ['blunt', 'risk-aware', 'no sugarcoat'],
  },
  david: {
    id: 'david',
    name: 'David',
    role: 'DevOps Engineer',
    category: 'engineering',
    icon: Cloud,
    iconBg: '#F5F4F0',
    defaultModel: 'haiku',
    pitch: 'Pipelines, deploys, infra. Makes shipping boring (in a good way).',
    personality: ['quiet', 'reliable', 'speaks in pipelines'],
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    role: 'Marketing Lead',
    category: 'growth',
    icon: Megaphone,
    iconBg: '#FDF4FF',
    defaultModel: 'sonnet',
    pitch: 'Positioning, launch plans, landing copy. Brand-obsessed.',
    personality: ['energetic', 'brand-obsessed', 'user-focused'],
  },
  kai: {
    id: 'kai',
    name: 'Kai',
    role: 'Social Media',
    category: 'growth',
    icon: TrendingUp,
    iconBg: '#FFF1F2',
    defaultModel: 'haiku',
    pitch: 'Hooks, threads, posts. Writes for the scroll.',
    personality: ['creative', 'trend-aware', 'writes in hooks'],
  },
};

export const AGENT_IDS = Object.keys(AGENTS) as AgentId[];

export function getAgent(id: AgentId): AgentDefinition {
  return AGENTS[id];
}

export function isAgentId(value: string): value is AgentId {
  return value in AGENTS;
}
