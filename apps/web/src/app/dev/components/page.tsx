import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { AgentBadge } from '@/features/agents/components/AgentBadge';
import {
  StatusRing,
  type AgentStatus,
} from '@/features/agents/components/StatusRing';
import { TypingIndicator } from '@/features/agents/components/TypingIndicator';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { DeskCard } from '@/features/office-floor/components/DeskCard';
import { MeetingRoom } from '@/features/office-floor/components/MeetingRoom';
import { OfficeFloor } from '@/features/office-floor/components/OfficeFloor';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AGENT_IDS } from '@/lib/agents/registry';

export const metadata = { title: 'Component playground' };

const ALL_STATUSES: AgentStatus[] = ['active', 'busy', 'blocked', 'talking', 'idle'];

/**
 * /dev/components — internal pixel-checker. Renders every component against
 * `sojoai-design-system-v3.html`. 404s in production so it never ships.
 */
export default function ComponentPlaygroundPage(): React.ReactElement {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <PageWrapper
      eyebrow="Internal · /dev/components"
      title="Component playground"
      description="Every Sojo AI component, rendered against the locked tokens. Compare against shiftai-design-system-v3.html."
      size="wide"
    >
      <Section title="01 — Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button intent="primary">Primary</Button>
          <Button intent="secondary">Secondary</Button>
          <Button intent="ghost">Ghost</Button>
          <Button intent="danger">Danger</Button>
          <Button intent="primary" size="sm">
            Small
          </Button>
          <Button intent="primary" size="lg">
            Large
          </Button>
          <Button intent="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="02 — Badges">
        <div className="flex flex-wrap items-center gap-3">
          {(['neutral', 'accent', 'success', 'warning', 'danger', 'info', 'dark'] as const).map(
            (intent) => (
              <Badge key={intent} intent={intent}>
                {intent}
              </Badge>
            ),
          )}
        </div>
      </Section>

      <Section title="03 — Inputs">
        <div className="grid max-w-md gap-3">
          <Input placeholder="Email address" />
          <Input placeholder="Invalid input" defaultValue="not an email" invalid />
          <Input placeholder="Disabled" disabled />
        </div>
      </Section>

      <Section title="04 — Skeleton">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Section>

      <Section title="05 — Status rings">
        <div className="flex items-center gap-6">
          {ALL_STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-2 text-sm text-warm-700">
              <StatusRing status={s} />
              {s}
            </span>
          ))}
        </div>
      </Section>

      <Section title="06 — Typing indicator">
        <TypingIndicator />
      </Section>

      <Section title="07 — Agent icon wraps (all sizes)">
        <div className="flex items-end gap-4">
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <AgentIconWrap key={size} agentId="sarah" size={size} />
          ))}
        </div>
      </Section>

      <Section title="08 — Agent badges (all 10 agents)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AGENT_IDS.map((id) => (
            <AgentBadge key={id} agentId={id} />
          ))}
        </div>
      </Section>

      <Section title="09 — Project card variants">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProjectCard
            id="demo-1"
            name="Mango Health"
            description="Diet-tracking SaaS for endurance athletes."
            hiredAgents={['sarah', 'alex', 'lena', 'marcus']}
            openTaskCount={12}
            blockerCount={0}
            lastActivityAt={new Date(Date.now() - 1000 * 60 * 12).toISOString()}
          />
          <ProjectCard
            id="demo-2"
            name="Glass Studio"
            description="Marketing site rebuild for an independent design studio."
            hiredAgents={['sarah', 'alex', 'lena', 'mia', 'kai', 'ryan']}
            openTaskCount={4}
            blockerCount={2}
            lastActivityAt={new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()}
          />
          <ProjectCard
            id="demo-3"
            name="Legacy archive"
            description="An old project, archived after launch."
            hiredAgents={['sarah', 'marcus']}
            openTaskCount={0}
            blockerCount={0}
            lastActivityAt={new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()}
            archived
          />
        </div>
      </Section>

      <Section title="10 — Desk cards (one per status)">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DeskCard
            projectId="demo"
            agentId="sarah"
            status="active"
            currentTask="Drafting the v1 PRD"
            progress={62}
          />
          <DeskCard
            projectId="demo"
            agentId="alex"
            status="busy"
            currentTask="Awaiting PRD from Sarah"
            progress={20}
          />
          <DeskCard
            projectId="demo"
            agentId="ryan"
            status="blocked"
            currentTask="OAuth scopes unclear — needs answer"
          />
          <DeskCard projectId="demo" agentId="lena" status="talking" currentTask="Pairing with Marcus" />
          <DeskCard projectId="demo" agentId="kai" status="idle" />
        </div>
      </Section>

      <Section title="11 — Meeting room">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <MeetingRoom participants={['alex', 'marcus']} topic="API contract for the editor" />
        </div>
      </Section>

      <Section title="12 — Office Floor (the signature)">
        <OfficeFloor
          projectId="demo"
          meeting={{ participants: ['sarah', 'alex'], topic: 'Reviewing the PRD' }}
          desks={[
            { agentId: 'lena', status: 'active', currentTask: 'Wiring the OfficeFloor', progress: 80 },
            { agentId: 'marcus', status: 'active', currentTask: 'Schema for ProjectBrain', progress: 45 },
            { agentId: 'ryan', status: 'blocked', currentTask: 'Auditing OAuth scopes' },
            { agentId: 'nina', status: 'idle' },
          ]}
          emptySlots={2}
        />
      </Section>
    </PageWrapper>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="border-t border-warm-200 py-10 first:border-t-0">
      <h2 className="mb-6 font-mono text-[10px] tracking-widest text-warm-400 uppercase">{title}</h2>
      {children}
    </section>
  );
}
