import * as React from 'react';
import { ConversationList } from '@/features/chat/components/ConversationList';

interface MessagesLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

/**
 * /messages layout — WhatsApp-style split.
 *
 * Left:  persistent ConversationList (320px on lg+, hidden on small screens).
 *        Doesn't unmount when the route changes, so its filter state survives.
 * Right: the active conversation (DM, #general, or empty state) renders here.
 *
 * On mobile, the left rail is hidden — /messages/page.tsx falls back to a
 * full-width agent list so users can still navigate to a conversation.
 */
export default async function MessagesLayout({
  children,
  params,
}: MessagesLayoutProps): Promise<React.ReactElement> {
  const { projectId } = await params;
  return (
    <div className="flex h-full">
      <aside
        aria-label="Conversations"
        className="hidden w-80 shrink-0 border-r border-warm-200 lg:flex"
      >
        <ConversationList projectId={projectId} />
      </aside>
      <section className="min-w-0 flex-1 overflow-hidden">{children}</section>
    </div>
  );
}
