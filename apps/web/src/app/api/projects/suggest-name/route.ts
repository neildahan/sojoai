import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { MODEL_IDS } from '@/lib/ai/models';
import { getAnthropic } from '@/lib/ai/client';
import { recordUsage } from '@/lib/ai/usage';

/**
 * POST /api/projects/suggest-name
 *
 * Generates 4 brand-style project name suggestions from a description.
 * Always Haiku — this is a cheap utility call, not creative heavy lifting.
 *
 * Auth required (Clerk). Body shape:
 *   { description: string }   ← 10–500 chars
 *
 * Returns:
 *   { suggestions: string[] }  ← typically 4 items, may be shorter
 *
 * On missing ANTHROPIC_API_KEY: returns 503 with a friendly error body
 * so the client can show a hint rather than a generic failure.
 */

export const runtime = 'nodejs';

const BodySchema = z.object({
  description: z.string().min(10).max(500),
});

const SYSTEM_PROMPT = [
  'You generate brandable software project names.',
  'Output exactly 4 names, one per line.',
  'Rules: no numbering, no quotes, no explanation, no trailing punctuation.',
  'Names should be: 1–3 words, memorable, distinct, brand-style (not literal description).',
  'Avoid: numbers, the suffix "AI"/"Tech"/"Lab", and generic words like "Project", "App", "Platform".',
  'Prefer: short coined words, evocative metaphors, single nouns.',
].join(' ');

export async function POST(req: NextRequest): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Invalid body', details: String(err) }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'AI is not configured',
        hint:
          err instanceof Error && err.message.includes('ANTHROPIC_API_KEY')
            ? 'Set ANTHROPIC_API_KEY in apps/web/.env.local to enable name suggestions.'
            : 'Anthropic client unavailable.',
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }

  try {
    const message = await client.messages.create({
      model: MODEL_IDS.haiku,
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Project description:\n${body.description}\n\nGenerate 4 name suggestions.`,
        },
      ],
    });

    const text =
      message.content.find((c): c is { type: 'text'; text: string; citations?: unknown } =>
        c.type === 'text',
      )?.text ?? '';

    const suggestions = parseSuggestions(text);

    recordUsage({
      projectId: '__suggest__',
      agentId: 'sarah',
      tier: 'haiku',
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return Response.json({ suggestions });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Suggestion generation failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
}

/**
 * Strip bullets/numbering, trim, drop empties + over-long lines.
 * Returns at most 4 suggestions.
 */
function parseSuggestions(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^[-*•\d.)]+\s*/, '') // strip leading bullet/number prefixes
        .replace(/^["'`]|["'`]$/g, '') // strip surrounding quotes
        .trim(),
    )
    .filter((line) => line.length > 0 && line.length <= 40)
    .slice(0, 4);
}
