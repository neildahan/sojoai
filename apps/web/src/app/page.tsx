import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentBadge } from '@/features/agents/components/AgentBadge';
import { StatusRing } from '@/features/agents/components/StatusRing';
import { AGENT_IDS } from '@/lib/agents/registry';

/**
 * Public landing page placeholder. Exercises the locked design tokens
 * and the first wave of components (Button, Badge, AgentBadge, StatusRing)
 * so we can visually verify against `sojoai-design-system-v3.html`.
 *
 * Real marketing copy and components land in Phase 3.
 */
export default function HomePage(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-12 px-8 py-24">
      <section>
        <Badge intent="dark" size="sm">
          ✦ Sojo AI · v0.0.0
        </Badge>
        <h1 className="mt-4 font-display text-5xl leading-tight font-medium text-warm-900 sm:text-6xl">
          Built for <em className="text-indigo-600">humans</em>,
          <br />
          powered by <em className="text-indigo-600">agents</em>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-warm-500">
          Hire a virtual team of ten specialists. They talk to each other, ship real deliverables,
          and run your standup — so you can build without hiring.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <Link href="/sign-up" className={buttonVariants({ intent: 'primary', size: 'md' })}>
            Open the workspace
          </Link>
          <Link
            href="/dev/components"
            className={buttonVariants({ intent: 'secondary', size: 'md' })}
          >
            View components
          </Link>
        </div>
      </section>

      <section className="border-t border-warm-200 pt-10">
        <span className="font-mono text-[10px] tracking-widest text-warm-400 uppercase">
          Meet the team
        </span>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {AGENT_IDS.slice(0, 6).map((id) => (
            <div key={id} className="flex items-center justify-between">
              <AgentBadge agentId={id} size="md" />
              <StatusRing
                status={id === 'sarah' ? 'talking' : id === 'ryan' ? 'blocked' : 'active'}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
