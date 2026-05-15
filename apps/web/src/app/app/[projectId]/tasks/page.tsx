import * as React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskBoard, type BoardTask } from '@/features/tasks/components/TaskBoard';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Tasks' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/tasks — master task board.
 *
 * Currently renders a hard-coded sample so the kanban layout is browsable.
 * Real tasks come from the `Task` collection once Mongo is wired.
 */
export default async function TasksPage({ params }: PageProps): Promise<React.ReactElement> {
  const { projectId: _projectId } = await params;
  void _projectId;

  const tasks: BoardTask[] = [
    {
      id: '1',
      title: 'Draft v1 PRD',
      description: 'Problem, goals, non-goals, user stories, milestones.',
      status: 'in-progress',
      priority: 'high',
      assigneeId: 'sarah',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: '2',
      title: 'Auth + onboarding wireframes',
      status: 'todo',
      priority: 'medium',
      assigneeId: 'alex',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: '3',
      title: 'Scaffold dashboard route',
      description: 'App shell, navigation, route group split.',
      status: 'in-progress',
      priority: 'high',
      assigneeId: 'lena',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: '4',
      title: 'Workout ingestion API',
      status: 'todo',
      priority: 'medium',
      assigneeId: 'marcus',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: '5',
      title: 'Audit OAuth scopes',
      description: 'Existing scopes look broader than needed.',
      status: 'blocked',
      priority: 'high',
      assigneeId: 'ryan',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: '6',
      title: 'Initial QA pass on auth',
      status: 'todo',
      priority: 'low',
      assigneeId: 'nina',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '7',
      title: 'Naming + tagline shortlist',
      status: 'done',
      priority: 'medium',
      assigneeId: 'mia',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  const counts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <PageWrapper
      eyebrow="Project board"
      title="Tasks"
      description="The full picture — everyone's work, all in one place."
      size="wide"
    >
      <div className="mb-6 flex items-center gap-2">
        <Badge intent="neutral">{counts.todo ?? 0} todo</Badge>
        <Badge intent="info">{counts['in-progress'] ?? 0} in progress</Badge>
        <Badge intent="danger">{counts.blocked ?? 0} blocked</Badge>
        <Badge intent="success">{counts.done ?? 0} done</Badge>
      </div>
      <TaskBoard tasks={tasks} />
    </PageWrapper>
  );
}
