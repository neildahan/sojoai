import * as React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Project settings' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/settings — project-level configuration.
 * Form is read-only / non-persistent until Mongo lands.
 */
export default async function SettingsPage({ params }: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;
  const isDemo = projectId === 'demo';

  return (
    <PageWrapper
      eyebrow="Project settings"
      title="Settings"
      description="Project name, working hours, daily standup time, and the dangerous zone."
      size="narrow"
    >
      <form className="flex flex-col gap-6 rounded-lg border border-warm-200 bg-surface-card p-6 shadow-desk">
        <Field label="Project name" hint="Shown in the sidebar and notifications.">
          <Input
            name="name"
            defaultValue={isDemo ? 'Mango Health' : projectId}
            disabled={isDemo}
          />
        </Field>

        <Field label="Description">
          <Textarea
            name="description"
            rows={3}
            defaultValue={
              isDemo
                ? 'A diet-tracking app for endurance athletes that learns from each workout.'
                : ''
            }
            disabled={isDemo}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Daily standup time" hint="Jamie sends the digest at this local time.">
            <Input name="standupTime" type="time" defaultValue="09:00" />
          </Field>
          <Field label="Timezone">
            <Input name="timezone" defaultValue="UTC" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Working hours start">
            <Input name="workingHoursStart" type="time" defaultValue="09:00" />
          </Field>
          <Field label="Working hours end">
            <Input name="workingHoursEnd" type="time" defaultValue="18:00" />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-warm-200 pt-4">
          <Badge intent="warning" size="sm">
            Mongo not wired — saves are stubs
          </Badge>
          <Button type="button" intent="primary" size="md" disabled>
            Save changes
          </Button>
        </div>
      </form>

      <section className="mt-8 flex items-center justify-between gap-4 rounded-lg border border-status-blocked/30 bg-status-blocked/5 p-5">
        <div>
          <h3 className="font-display text-base italic text-warm-900">Archive this project</h3>
          <p className="text-xs text-warm-500">
            Hides it from your home view. You can restore from the archived section later.
          </p>
        </div>
        <Button type="button" intent="danger" size="sm" disabled>
          Archive
        </Button>
      </section>
    </PageWrapper>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-warm-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-warm-400">{hint}</span> : null}
    </label>
  );
}
