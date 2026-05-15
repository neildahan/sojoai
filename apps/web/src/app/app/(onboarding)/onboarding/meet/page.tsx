import * as React from 'react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { MeetTeamForm } from '@/features/onboarding/components/MeetTeamForm';
import { mapNeedsToTeam } from '@/features/onboarding/lib/recommend';
import { hireFirstAgentAction } from '../actions';

export const metadata = { title: 'Meet your team' };

interface PageProps {
  searchParams: Promise<{
    type?: string;
    name?: string;
    desc?: string;
    need?: string | string[];
  }>;
}

/**
 * Step 4 — Meet your team.
 *
 * Shows every agent the wizard recommends, derived from the user's picks
 * in Step 3. The user can remove any teammate before hiring (Jamie
 * excepted — he's always-included as the team coordinator). Submitting
 * `hireFirstAgentAction` creates a Team doc per kept agent. Removals
 * after onboarding happen one-click from the team room.
 */
export default async function OnboardingMeetPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const needs = toArray(params.need);
  const team = mapNeedsToTeam(needs);
  const backHref = `/app/onboarding/needs?${buildBackQuery(
    params.type,
    params.name,
    params.desc,
    needs,
  )}`;
  const projectLabel = params.name?.trim() || 'your project';

  return (
    <div className="w-full max-w-2xl">
      <WizardStepIndicator current={4} total={4} className="mb-8" />
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        Meet your <em className="text-indigo-600">team</em>.
      </h1>
      <p className="mt-3 text-warm-500">
        Based on what you picked, this is the team for <strong>{projectLabel}</strong>. The
        first agent listed leads the project — the rest pick up work behind them. Remove anyone
        you don&rsquo;t need; you can add more later from the Hiring Room.
      </p>

      <div className="mt-10">
        <MeetTeamForm
          team={team}
          projectType={params.type ?? 'fresh'}
          projectName={params.name ?? ''}
          projectDesc={params.desc ?? ''}
          needs={needs}
          backHref={backHref}
          action={hireFirstAgentAction}
        />
      </div>
    </div>
  );
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Build the back-to-Step-3 URL preserving every selected need.
 * URLSearchParams.append handles repeated keys (Object.fromEntries doesn't).
 */
function buildBackQuery(
  type: string | undefined,
  name: string | undefined,
  desc: string | undefined,
  needs: readonly string[],
): string {
  const sp = new URLSearchParams();
  if (type) sp.set('type', type);
  if (name) sp.set('name', name);
  if (desc) sp.set('desc', desc);
  for (const n of needs) sp.append('need', n);
  return sp.toString();
}
