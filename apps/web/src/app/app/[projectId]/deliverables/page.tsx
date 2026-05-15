import * as React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  DeliverableCard,
  type DeliverableCardProps,
} from '@/features/deliverables/components/DeliverableCard';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Deliverables' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/deliverables — the "project brain".
 *
 * Lists every output the team has produced. Real data lands once Mongo is
 * wired; for now, hardcoded samples.
 */
export default async function DeliverablesIndexPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;

  const items: DeliverableCardProps[] = [
    {
      id: 'd1',
      title: 'Mango Health — v1 PRD',
      type: 'prd',
      agentId: 'sarah',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      href: `/app/${projectId}/deliverables/d1`,
    },
    {
      id: 'd2',
      title: 'Auth + onboarding wireframes',
      type: 'wireframes',
      agentId: 'alex',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      href: `/app/${projectId}/deliverables/d2`,
    },
    {
      id: 'd3',
      title: 'Workout ingestion API — draft schema',
      type: 'backend-code',
      agentId: 'marcus',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      href: `/app/${projectId}/deliverables/d3`,
    },
  ];

  return (
    <PageWrapper
      eyebrow="Project brain"
      title="Deliverables"
      description="Everything the team has shipped, in one place. Export to Google Docs, Notion, or download as Markdown."
      actions={<Badge intent="neutral">{items.length} items</Badge>}
    >
      <ul className="flex flex-col gap-3">
        {items.map((d) => (
          <li key={d.id}>
            <DeliverableCard {...d} />
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}
