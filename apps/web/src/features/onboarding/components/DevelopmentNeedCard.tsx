'use client';

import * as React from 'react';
import { Check, Code2, ChevronDown, ChevronUp, Monitor, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DevelopmentNeedCard — Step 3 special-case card for "Development".
 *
 * One bordered card. The top region is a `<label>` that toggles the
 * "development" need on/off. Once on, a thin divider and a "Customize"
 * trigger appear INSIDE the same card border. Click Customize → the
 * card extends downward (still within its own border) to reveal two
 * sub-checkboxes (frontend / backend).
 *
 * Hidden `<input name="need">` elements do the actual form submission:
 *   - Card off                                  → submits nothing
 *   - On, customize closed                      → submits `need=development`
 *   - On, customize open, no sub picked         → submits `need=development` (= both)
 *   - On, customize open, frontend only         → submits `need=frontend`
 *   - On, customize open, backend only          → submits `need=backend`
 *   - On, customize open, both picked           → submits `need=frontend` AND `need=backend`
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

  const submittedValues: string[] = React.useMemo(() => {
    if (!included) return [];
    if (!showCustomize || (!frontend && !backend)) return ['development'];
    const out: string[] = [];
    if (frontend) out.push('frontend');
    if (backend) out.push('backend');
    return out;
  }, [included, showCustomize, frontend, backend]);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-surface-card shadow-desk transition-all',
        included
          ? 'border-indigo-400 ring-1 ring-indigo-400/40'
          : 'border-warm-200',
      )}
    >
      {/* Main toggle area — wraps in a label so the whole row is a click target */}
      <label className="group flex cursor-pointer items-start gap-4 p-5 hover:bg-warm-50/40 focus-within:bg-warm-50/40">
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

      {/* Inline Customize trigger — only when included. Inside the card border. */}
      {included ? (
        <div className="flex items-center justify-end border-t border-warm-200/70 bg-warm-50/40 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setShowCustomize((v) => !v)}
            aria-expanded={showCustomize}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-warm-500 uppercase transition-colors hover:text-indigo-600"
          >
            {showCustomize ? (
              <>
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
                Hide options
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                Customize
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* Sub-options panel — also inside the card border */}
      {included && showCustomize ? (
        <div className="flex flex-col gap-2 border-t border-warm-200/70 bg-indigo-50/30 p-4">
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
        checked
          ? 'border-indigo-400 ring-1 ring-indigo-400/40'
          : 'border-warm-200 hover:border-warm-300',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-warm-100 text-warm-700"
      >
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
