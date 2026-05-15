import * as React from 'react';
import { TaskCard, type TaskCardProps, type TaskStatus } from './TaskCard';
import { cn } from '@/lib/utils';

export interface BoardTask extends TaskCardProps {
  id: string;
}

export interface TaskBoardProps {
  tasks: BoardTask[];
  className?: string;
}

const COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'todo', label: 'Todo' },
  { status: 'in-progress', label: 'In progress' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'done', label: 'Done' },
];

export function TaskBoard({ tasks, className }: TaskBoardProps): React.ReactElement {
  const byStatus = (s: TaskStatus): BoardTask[] => tasks.filter((t) => t.status === s);

  return (
    <div className={cn('grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4', className)}>
      {COLUMNS.map((col) => {
        const colTasks = byStatus(col.status);
        return (
          <section key={col.status} aria-label={col.label} className="flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <h3 className="font-mono text-[10px] tracking-widest text-warm-500 uppercase">
                {col.label}
              </h3>
              <span className="font-mono text-[10px] text-warm-400">{colTasks.length}</span>
            </header>
            <div className="flex flex-col gap-3">
              {colTasks.length === 0 ? (
                <div className="rounded-md border border-dashed border-warm-200 p-4 text-center text-xs text-warm-400">
                  Nothing here.
                </div>
              ) : (
                colTasks.map((t) => <TaskCard key={t.id} {...t} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
