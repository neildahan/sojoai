import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/webhooks/clerk
 *
 * Receives webhooks from Clerk for user lifecycle events. We care about:
 *   - user.created   → create a User doc in Mongo + initialise plan=free
 *   - user.updated   → mirror email / name / avatarUrl changes
 *   - user.deleted   → soft-delete the User doc and their projects
 *
 * Setup:
 *   1. In Clerk Dashboard → Webhooks → "Add endpoint" pointing at this URL.
 *   2. Subscribe to user.created, user.updated, user.deleted.
 *   3. Copy the signing secret into CLERK_WEBHOOK_SECRET in apps/web/.env.local.
 *   4. Install `svix` for signature verification:  pnpm add svix
 *
 * Until both CLERK_WEBHOOK_SECRET and MONGODB_URI are set, this route logs
 * the event and 200s — Clerk's "Test" button still gets a clean response.
 */

export const runtime = 'nodejs';

const EventSchema = z.object({
  type: z.string(),
  data: z.record(z.unknown()),
});

export async function POST(req: NextRequest): Promise<Response> {
  // TODO(phase-3.2): verify signature with svix using CLERK_WEBHOOK_SECRET.
  // Until then, accept payloads in dev and reject in production.
  if (process.env.NODE_ENV === 'production' && !process.env.CLERK_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 503 });
  }

  let event: z.infer<typeof EventSchema>;
  try {
    event = EventSchema.parse(await req.json());
  } catch (err) {
    return new Response(`Invalid payload: ${err instanceof Error ? err.message : 'unknown'}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated':
    case 'user.deleted':
      // TODO(phase-3.2): persist via lib/db/models/User.
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console -- intentional dev diagnostic
        console.log(`[clerk webhook] ${event.type}`, {
          id: (event.data as { id?: string }).id,
        });
      }
      break;
    default:
      // Ignore other event types — Clerk still expects a 200.
      break;
  }

  return new Response(null, { status: 200 });
}
