import * as React from 'react';
import { Github, Figma, BookOpen, Briefcase, Database, Mail } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Integrations' };

const INTEGRATIONS = [
  {
    icon: Github,
    label: 'GitHub',
    desc: 'Sync repo structure, key files, and open issues.',
    soon: false,
  },
  {
    icon: Figma,
    label: 'Figma',
    desc: 'Read components, color tokens, and text styles.',
    soon: false,
  },
  { icon: BookOpen, label: 'Notion', desc: 'Mirror specs and meeting notes.', soon: false },
  {
    icon: Briefcase,
    label: 'Jira / Linear',
    desc: 'See issues your team is already tracking.',
    soon: false,
  },
  {
    icon: Database,
    label: 'Google Drive',
    desc: 'Export deliverables to your Drive workspace.',
    soon: false,
  },
  {
    icon: Mail,
    label: 'Slack',
    desc: 'Get standup digests in your team channel.',
    soon: true,
  },
];

export default function IntegrationsPage(): React.ReactElement {
  return (
    <PageWrapper
      eyebrow="Integrations"
      title="Connect your stack"
      description="The more context your agents have, the better their first draft. Connect what you use — the rest stays untouched."
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {INTEGRATIONS.map(({ icon: Icon, label, desc, soon }) => (
          <li
            key={label}
            className="flex items-start gap-4 rounded-lg border border-warm-200 bg-surface-card p-5 shadow-desk"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warm-100 text-warm-700"
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base italic text-warm-900">{label}</h3>
                {soon ? (
                  <Badge intent="warning" size="sm">
                    Coming soon
                  </Badge>
                ) : (
                  <Badge intent="neutral" size="sm">
                    Not connected
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-warm-500">{desc}</p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex h-8 items-center rounded-sm border border-warm-200 px-3 text-xs font-medium text-warm-500"
            >
              {soon ? 'Soon' : 'Connect'}
            </button>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}
