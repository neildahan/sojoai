'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Loader, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { submitDescribeAction } from '@/app/app/(onboarding)/onboarding/actions';

/**
 * DescribeForm — Step 2 of the wizard.
 *
 * Flow:
 *   1. User describes the project (textarea is the lead field).
 *   2. Clicks "✨ Suggest names" to fetch 4 AI suggestions based on the
 *      description; pick one to populate the name field, or type their own.
 *   3. Submits → submitDescribeAction (server) → /onboarding/needs.
 *
 * Both fields are controlled so suggestion chips can write into the name
 * input cleanly. The form's `action` still points at the server action;
 * uncontrolled-vs-controlled doesn't change how server actions read form
 * data.
 */

export interface DescribeFormProps {
  error?: string;
}

export function DescribeForm({ error }: DescribeFormProps): React.ReactElement {
  const [description, setDescription] = React.useState('');
  const [name, setName] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hint, setHint] = React.useState<string | null>(null);

  const canSuggest = description.trim().length >= 10 && !loading;

  const suggest = React.useCallback(async () => {
    setLoading(true);
    setHint(null);
    try {
      const res = await fetch('/api/projects/suggest-name', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data: { suggestions?: string[]; error?: string; hint?: string } = await res.json();
      if (!res.ok) {
        setSuggestions([]);
        setHint(data.hint ?? data.error ?? 'Couldn\'t generate names right now.');
        return;
      }
      setSuggestions(data.suggestions ?? []);
      if (!data.suggestions || data.suggestions.length === 0) {
        setHint('No suggestions came back — try a richer description.');
      }
    } catch {
      setSuggestions([]);
      setHint('Network error — try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [description]);

  return (
    <form action={submitDescribeAction} className="mt-10 flex flex-col gap-6">
      {/* Description — the lead field */}
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-warm-700">What does it do?</span>
        <Textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A diet-tracking app for endurance athletes that learns from each workout…"
          required
          rows={5}
          maxLength={500}
          invalid={error === 'missing'}
        />
        <span className="font-mono text-[10px] text-warm-400">
          Up to 500 characters. The more specific, the better the name suggestions.
        </span>
      </label>

      {/* Name — with AI suggest */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-warm-700">Project name</span>
          <button
            type="button"
            onClick={suggest}
            disabled={!canSuggest}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              'border border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-50',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-live="polite"
          >
            {loading ? (
              <Loader className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-3 w-3" aria-hidden="true" />
            )}
            {loading ? 'Thinking…' : 'Suggest names'}
          </button>
        </div>
        <Input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type a name, or click a suggestion below"
          required
          maxLength={80}
          autoComplete="off"
          invalid={error === 'missing'}
        />

        {/* Suggestion chips */}
        {suggestions.length > 0 ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-warm-400 uppercase">
              Try
            </span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setName(s)}
                className={cn(
                  'inline-flex h-7 items-center rounded-full border px-3 text-sm font-medium transition-colors',
                  name === s
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-warm-200 bg-surface-card text-warm-700 hover:bg-indigo-50/40 hover:border-indigo-300',
                )}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSuggestions([])}
              aria-label="Dismiss suggestions"
              className="inline-flex h-7 items-center rounded-full px-2 text-warm-400 hover:text-warm-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {hint ? (
          <p className="mt-1 rounded-md bg-warm-100 px-3 py-2 text-xs text-warm-600">{hint}</p>
        ) : null}
      </div>

      {error === 'missing' ? (
        <p role="alert" className="text-sm text-status-blocked">
          Both name and description are required.
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <Link
          href="/app/onboarding/start"
          className={buttonVariants({ intent: 'ghost', size: 'md' })}
        >
          Back
        </Link>
        <Button type="submit" intent="primary" size="md">
          Continue
        </Button>
      </div>
    </form>
  );
}
