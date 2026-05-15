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

const SYSTEM_PROMPT = `You are a top brand strategist naming early-stage software products. You produce names that feel like real, ownable brands — not descriptions of what the product does.

Output rules:
- Exactly 4 names, one per line.
- No numbering, no quotes, no explanation, no trailing punctuation, no surrounding text.
- Each name is ideally 1 word (2 words MAX, and only as an exception).
- Memorable, easy to spell, easy to say out loud, .com-friendly.

Hard constraints:
- DO NOT reuse any noun from the user's description.
- DO NOT use industry vocabulary that gives away the domain. For example, for an insurance product, REJECT: Coverage, Claim, Policy, Adjuster, Underwrite, Risk, Insure, Premium, Meridian, Nexus. For a fitness product, REJECT: Train, Fit, Run, Pace, Workout. The name should NOT reveal the industry at first glance.
- DO NOT use suffixes: AI, Tech, Lab, App, Cloud, Hub, Studio, Suite, OS, IO, .com, .ai.
- DO NOT use numbers.
- DO NOT use generic words: Project, App, Platform, Tool, System.

Inspiration — names that succeed because they DON'T describe what the product does:
  Notion, Linear, Stripe, Vercel, Figma, Cal, Plaid, Asana, Ramp, Brex, Lattice,
  Mercury, Webflow, Loom, Pitch, Sentry, Mux, Lago, Resend, Retool, Cron, Inngest.

Pull from: short evocative words (Beacon, Anchor, Pulse, Glide, Forge, Spire, Tide, Helm, Atlas, Harbor, Drift), coined/portmanteau (Notion, Vercel, Plaid, Brex), Latin/Greek roots (Lex, Vox, Nova, Aero, Sigma, Astra, Lumen), or repurposed words (Pitch, Sentry, Loom, Ramp, Forge).

Produce 4 names. Output nothing except the 4 names.`;

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
      // Sonnet, not Haiku — naming is a creative task and Sonnet's outputs
      // are visibly more brandable. Token budget stays tiny (4 short names),
      // so the cost difference is negligible per request.
      model: MODEL_IDS.sonnet,
      max_tokens: 200,
      temperature: 1,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Project description:\n${body.description}\n\nProduce 4 names that follow every rule. Remember: no industry words, no description words, brand-style only.`,
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
      tier: 'sonnet',
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
