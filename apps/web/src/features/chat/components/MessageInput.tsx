'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * MessageInput — textarea + send button.
 * - Cmd/Ctrl + Enter submits (matches the design system's `⌘↵ to send` hint).
 * - Auto-resizes up to ~6 lines, then scrolls.
 * - Disables when `pending` is true (parent owns the request lifecycle).
 *
 * Client component because keyboard handling + auto-resize + disabled state.
 * Parent passes `onSend(text)` and is responsible for clearing input via key prop.
 */

export interface MessageInputProps {
  onSend: (text: string) => void | Promise<void>;
  pending?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  onSend,
  pending = false,
  placeholder = 'Write a message…',
  className,
}: MessageInputProps): React.ReactElement {
  const [value, setValue] = React.useState('');
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const submit = React.useCallback(async () => {
    const text = value.trim();
    if (!text || pending) return;
    setValue('');
    await onSend(text);
    ref.current?.focus();
  }, [onSend, pending, value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className={cn(
        'flex items-end gap-2 rounded-md border border-warm-200 bg-surface-card p-2 shadow-desk',
        'focus-within:shadow-glow',
        className,
      )}
    >
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            void submit();
          }
        }}
        placeholder={placeholder}
        rows={2}
        disabled={pending}
        className="border-0 bg-transparent shadow-none focus-visible:shadow-none p-2"
        aria-label="Message"
      />
      <div className="flex flex-col items-end gap-1 pb-1.5">
        <Button
          type="submit"
          intent="primary"
          size="icon"
          disabled={pending || value.trim().length === 0}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span className="font-mono text-[9px] tracking-wide text-warm-400">⌘↵</span>
      </div>
    </form>
  );
}
