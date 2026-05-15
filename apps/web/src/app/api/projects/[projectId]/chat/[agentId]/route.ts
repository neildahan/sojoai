import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { isAgentId } from '@/lib/agents/registry';
import { route as routeClaude } from '@/lib/ai/router';
import { getAnthropic } from '@/lib/ai/client';
import { recordUsage } from '@/lib/ai/usage';
import type { ProjectContext } from '@/lib/ai/prompts';

/**
 * POST /api/projects/[projectId]/chat/[agentId]
 *
 * Streams an agent reply as Server-Sent Events. Each event carries one of:
 *   data: {"type":"delta","text":"…"}      ← token chunk
 *   data: {"type":"done","usage":{…}}      ← stream ended cleanly
 *   data: {"type":"error","message":"…"}   ← terminal error
 *
 * The client (`features/chat/ChatPanel`) appends `delta.text` to the active
 * assistant bubble and stops the typing indicator on `done` or `error`.
 *
 * Until Mongo is wired (Phase 3.2):
 *   - We don't look up the Conversation history; the client passes the full
 *     thread in `messages[]`.
 *   - We don't write the assistant reply back.
 *   - The route still requires the user to be signed in.
 */

export const runtime = 'nodejs';
// SSE keeps the connection open — opt out of caching.
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(50_000),
      }),
    )
    .min(1)
    .max(50),
  /** Allow client to bias to Opus for "go deep" requests. */
  forceTier: z.enum(['haiku', 'sonnet', 'opus']).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; agentId: string }> },
): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { projectId, agentId } = await params;
  if (!isAgentId(agentId)) {
    return new Response('Unknown agent', { status: 404 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body', details: String(err) }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  // TODO(phase-3.2): hydrate ProjectContext from MongoDB ProjectBrain doc.
  // For now, a minimal context so the prompt builder has something to inject.
  const project: ProjectContext = {
    projectId,
    name: 'Demo project',
    description: 'Streaming chat — Mongo not yet wired.',
  };

  const { modelId, tier, systemPrompt, maxOutputTokens } = routeClaude({
    agentId,
    taskType: 'chat',
    project,
    ...(body.forceTier ? { forceTier: body.forceTier } : {}),
  });

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    return sseErrorResponse(
      err instanceof Error ? err.message : 'Anthropic client unavailable',
      503,
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: object): void => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        const response = await client.messages.stream({
          model: modelId,
          system: systemPrompt,
          max_tokens: maxOutputTokens,
          messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send({ type: 'delta', text: event.delta.text });
          }
        }

        const finalMessage = await response.finalMessage();
        const usage = {
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
        };
        recordUsage({ projectId, agentId, tier, ...usage });
        send({ type: 'done', usage });
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'Stream failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no', // disable nginx buffering when proxied
    },
  });
}

function sseErrorResponse(message: string, status: number): Response {
  const body = `data: ${JSON.stringify({ type: 'error', message })}\n\n`;
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
    },
  });
}
