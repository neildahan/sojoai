import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * The pastel icon tile that fingerprints each agent across the app.
 * Bg color and Lucide icon come from the registry — never hard-code them.
 */

const wrapSize = cva('inline-flex shrink-0 items-center justify-center rounded-md', {
  variants: {
    size: {
      sm: 'h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5',
      md: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
      lg: 'h-12 w-12 [&>svg]:h-6 [&>svg]:w-6',
      xl: 'h-16 w-16 [&>svg]:h-8 [&>svg]:w-8 rounded-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface AgentIconWrapProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof wrapSize> {
  agentId: AgentId;
}

export function AgentIconWrap({
  agentId,
  size,
  className,
  style,
  ...rest
}: AgentIconWrapProps): React.ReactElement {
  const agent = getAgent(agentId);
  const Icon = agent.icon;
  return (
    <span
      role="img"
      aria-label={`${agent.name} (${agent.role})`}
      className={cn(wrapSize({ size }), 'text-warm-700', className)}
      style={{ backgroundColor: agent.iconBg, ...style }}
      {...rest}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}
