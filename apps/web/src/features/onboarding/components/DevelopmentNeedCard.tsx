'use client';

import * as React from 'react';
import { Check, Code2, ChevronDown, ChevronUp, Monitor, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DevelopmentNeedCard — Step 3 special-case card for "Development".
 *
 * Default state: a single "Development" card, looks just like the other
 * NeedToggleCards. Once checked, a subtle "Customize" expander appears.
 * Clicking it reveals two sub-checkboxes (Frontend / Backend) so power
 * users can narrow their pick.
 *
 * Form submission model:
 *   - Card unchecked                         → submits nothing
 *   - Checked, customize closed              → submits `need=development`
 *   - Checked, customize open, no sub picked → submits `need=development` (= both)
 *   - Checked, customize open, frontend only → submits `need=frontend`
 *   - Checked, customize open, backend only  → submits `need=backend`
 *   - Checked, customize open, both picked   → submits `need=frontend` AND `need=backend`
 *
 * Hidden `<input name="need">` elements do the actual submission. The
 * visible inputs are sr-only — the label is the click target.
 */

export interface DevelopmentNeedCardProps {
  defaultIncluded?: boolean;
  defaultFrontend?: boolean;
  defaultBackend?: boolean;
}

export function DevelopmentNeedCard({
  defaultIncluded = false,
  defaultFrontend = false,
  defaultBackend = false,
}: DevelopmentNeedCardProps): React.ReactElement {
  const [included, setIncluded] = React.useState(defaultIncluded);
  // Open Customize automatically if either sub-option was pre-selected.
  const [showCustomize, setShowCustomize] = React.useState(
    defaultFrontend || defaultBackend,
  );
  const [frontend, setFrontend] = React.useState(defaultFrontend);
  const [backend, setBackend] = React.useState(defaultBackend);

  // Compute what we actually submit. See file docblock for the truth table.
  const submittedValues: string[] = React.useMemo(() => {
    if (!included) return [];
    if (!showCustomize || (!frontend && !backend)) return ['development'];
    const out: string[] = [];
    if (frontend) out.push('frontend');
    if (backend) out.push('backend');
    return out;
  }, [included, showCustomize, frontend, backend]);

  return (
    <div className="flex flex-col gap-0">
      {/* The visible card (mirrors NeedToggleCard styling) */}
      <label
        className={cn(
          'group flex cursor-pointer items-start gap-4 rounded-lg border bg-surface-card p-5 shadow-desk transition-all',
          'hover:shadow-card focus-within:shadow-glow',
          included
            ? 'border-indigo-400 ring-1 ring-indigo-400/40'
            : 'border-warm-200 hover:border-warm-300',
          // When customize is open, square the bottom so the panel attaches.
          included && showCustomize && 'rounded-b-none',
        )}
      >
        <input
          type="checkbox"
          checked={included}
          onChange={(e) => setIncluded(e.target.checked)}
          className="sr-only"
          aria-label="Development"
        />
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-warm-700 [&>svg]:h-5 [&>svg]:w-5"
        >
          <Code2 />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base italic text-warm-900">Development</h3>
          <p className="mt-1 text-xs text-warm-500">
            Build the product — what users see and what runs behind it.
          </p>
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
            included
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : 'border-warm-300 bg-transparent text-transparent',
          )}
        >
          <Check className="h-3 w-3" />
        </span>
      </label>

      {/* Customize toggle (visible only when included) */}
      {included ? (
        <button
          type="button"
          onClick={() => setShowCustomize((v) => !v)}
          aria-expanded={showCustomize}
          className={cn(
            'flex items-center justify-center gap-1.5 self-end px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors',
            'text-warm-500 hover:text-indigo-600',
            showCustomize ? 'sr-only' : '',
          )}
        >
          {showCustomize ? (
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          )}
          Customize
        </button>
      ) : null}

      {/* Sub-options panel */}
      {included && showCustomize ? (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-b-lg border border-t-0 bg-indigo-50/30 p-4',
            'border-indigo-400',
          )}
        >
          <p className="mb-1 font-mono text-[10px] tracking-widest text-warm-500 uppercase">
            What kind of development?
          </p>
          <SubCheckbox
            label="Just the frontend"
            description="What users see and tap — screens, buttons, layout."
            icon={<Monitor className="h-4 w-4" />}
            checked={frontend}
            onChange={setFrontend}
          />
          <SubCheckbox
            label="Just the backend"
            description="Data, APIs, server logic — the bits behind the screens."
            icon={<Server className="h-4 w-4" />}
            checked={backend}
            onChange={setBackend}
          />
          <p className="mt-1 text-[11px] text-warm-500">
            Leave both unchecked for the default <strong className="font-medium">both</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowCustomize(false);
              setFrontend(false);
              setBackend(false);
            }}
            className="self-start text-[11px] text-warm-500 underline hover:text-warm-700"
          >
            Close customize
          </button>
        </div>
      ) : null}

      {/* Hidden inputs that actually submit */}
      {submittedValues.map((v) => (
        <input key={v} type="hidden" name="need" value={v} />
      ))}
    </div>
  );
}

function SubCheckbox({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
}): React.ReactElement {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md border bg-surface-card p-3 transition-colors',
        checked ? 'border-indigo-400 ring-1 ring-indigo-400/40' : 'border-warm-200 hover:border-warm-300',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-warm-100 text-warm-700">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-warm-800">{label}</span>
        <p className="text-[11px] text-warm-500">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          checked
            ? 'border-indigo-500 bg-indigo-500 text-white'
            : 'border-warm-300 bg-transparent text-transparent',
        )}
      >
        <Check className="h-2.5 w-2.5" />
      </span>
    </label>
  );
}
