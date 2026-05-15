import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Play } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { OfficeFloor } from '@/features/office-floor/components/OfficeFloor';
import type { OfficeFloorDesk, OfficeFloorMeeting } from '@/features/office-floor/components/OfficeFloor';

export const metadata = { title: 'Team Room' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/team-room — the heart of the app. Renders the Office Floor.
 *
 * Until Mongo is wired (Phase 3.2), only `projectId === 'demo'` resolves —
 * any other id 404s. The demo data exercises every Office Floor variant:
 * a meeting in progress, one active desk, one busy, one blocked, one idle,
 * plus two empty slots.
 */
export default async function TeamRoomPage({ params }: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;

  if (projectId !== 'demo') {
    // TODO(phase-3.2): fetch Project from Mongo, 404 if missing/unauthorized.
    notFound();
  }

  const projectName = 'Mango Health';
  const meeting: OfficeFloorMeeting = {
    participants: ['sarah', 'alex'],
    topic: 'Reviewing the v1 PRD',
  };
  const desks: OfficeFloorDesk[] = [
    {
      agentId: 'lena',
      status: 'active',
      currentTask: 'Scaffolding the dashboard route',
      progress: 65,
    },
    {
      agentId: 'marcus',
      status: 'busy',
      currentTask: 'Waiting on API contract from Sarah',
      progress: 30,
    },
    {
      agentId: 'ryan',
      status: 'blocked',
      currentTask: 'OAuth scopes — needs your input',
    },
    {
      agentId: 'nina',
      status: 'idle',
    },
  ];

  return (
    <PageWrapper
      eyebrow="Demo · /app/demo/team-room"
      title={projectName}
      description="Your team is working. The Meeting Room glows when two or more agents are talking — click any desk to message that agent directly."
      actions={
        <>
          <Link
            href={`/app/${projectId}/messages/meeting`}
            className={buttonVariants({ intent: 'secondary', size: 'sm' })}
            aria-label="Start a meeting"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Start meeting
          </Link>
          <Link
            href={`/app/${projectId}/hire`}
            className={buttonVariants({ intent: 'primary', size: 'sm' })}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Hire someone new
          </Link>
        </>
      }
      size="wide"
    >
      <div className="mb-6 flex items-center gap-2">
        <Badge intent="success">{desks.filter((d) => d.status === 'active').length} active</Badge>
        <Badge intent="warning">{desks.filter((d) => d.status === 'busy').length} waiting</Badge>
        <Badge intent="danger">{desks.filter((d) => d.status === 'blocked').length} blocked</Badge>
        <Badge intent="info">{meeting ? '1 meeting in progress' : 'No meetings'}</Badge>
      </div>

      <OfficeFloor projectId={projectId} desks={desks} meeting={meeting} emptySlots={2} />
    </PageWrapper>
  );
}
