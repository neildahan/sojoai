import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * TypingIndicator — three bouncing dots shown while an agent is generating.
 * Used inside ChatBubble when the response stream is open.
 */

export interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps): React.ReactElement {
  return (
    <span
      role="status"
      aria-label="Agent is typing"
      className={cn('inline-flex items-center gap-1', className)}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-warm-400 animate-bounce-dot"
        style={{ animationDelay: '0ms' }}
      />
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-warm-400 animate-bounce-dot"
        style={{ animationDelay: '150ms' }}
      />
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-warm-400 animate-bounce-dot"
        style={{ animationDelay: '300ms' }}
      />
    </span>
  );
}
