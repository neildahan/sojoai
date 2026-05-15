import * as React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  FileText,
  Link2,
  Settings as SettingsIcon,
  Home,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

/**
 * Project shell layout — used for every /app/[projectId]/* route.
 * Renders the dark Sidebar with project-scoped navigation. The cross-project
 * TopBar shell is intentionally NOT applied here (route group split).
 *
 * Until Mongo is wired, the sidebar uses a placeholder project label.
 * Phase 3.2 will swap in `Project.name` from the DB.
 */
export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps): Promise<React.ReactElement> {
  const { projectId } = await params;
  const base = `/app/${projectId}`;
  const isDemo = projectId === 'demo';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      <Sidebar
        brand={
          <span className="flex items-center gap-2 font-display text-lg italic text-warm-50">
            Sojo<span className="text-warm-400">AI</span>
          </span>
        }
        context={
          <span className="block px-2 py-1 font-mono text-[10px] tracking-widest text-warm-400 uppercase">
            {isDemo ? 'Demo project' : projectId}
          </span>
        }
        sections={[
          {
            items: [
              { label: 'Team Room', href: `${base}/team-room`, icon: <LayoutDashboard /> },
              { label: 'Messages', href: `${base}/messages`, icon: <MessageSquare /> },
              { label: 'Tasks', href: `${base}/tasks`, icon: <CheckSquare /> },
              { label: 'Deliverables', href: `${base}/deliverables`, icon: <FileText /> },
              { label: 'Integrations', href: `${base}/integrations`, icon: <Link2 /> },
            ],
          },
        ]}
        footer={[
          { label: 'All projects', href: '/app/home', icon: <Home /> },
          { label: 'Settings', href: `${base}/settings`, icon: <SettingsIcon /> },
        ]}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
