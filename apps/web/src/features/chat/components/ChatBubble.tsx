import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ChatBubble — a single message. Two variants:
 *   - agent: warm gray bubble, left-aligned, top-left corner straight
 *   - user:  dark warm-900 bubble, right-aligned, top-right corner straight
 *
 * The corner shape ("0 rmd rmd rmd" / "rmd 0 rmd rmd") is a design system
 * detail from sojoai-design-system-v3 — it visually anchors the bubble to
 * the sender side and makes the conversation feel directional.
 */

export type ChatBubbleVariant = 'agent' | 'user';

export interface ChatBubbleProps {
  variant: ChatBubbleVariant;
  children: React.ReactNode;
  /** Optional tiny meta line below the bubble (time, agent name, etc). */
  footer?: React.ReactNode;
  className?: string;
}

export function ChatBubble({
  variant,
  children,
  footer,
  className,
}: ChatBubbleProps): React.ReactElement {
  const isAgent = variant === 'agent';
  return (
    <div
      className={cn(
        'flex w-full max-w-prose flex-col gap-1',
        isAgent ? 'self-start items-start' : 'self-end items-end',
        className,
      )}
    >
      <div
        className={cn(
          'px-4 py-2.5 text-sm leading-relaxed shadow-desk',
          isAgent
            ? 'rounded-tl-none rounded-md bg-warm-100 text-warm-800'
            : 'rounded-tr-none rounded-md bg-warm-900 text-warm-50',
        )}
      >
        {children}
      </div>
      {footer ? (
        <span className="font-mono text-[10px] text-warm-400">{footer}</span>
      ) : null}
    </div>
  );
}
