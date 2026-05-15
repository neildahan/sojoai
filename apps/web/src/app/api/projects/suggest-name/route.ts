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

const SYSTEM_PROMPT = `You are a top brand strategist naming early-stage software products. Your goal: names that feel RIGHT for the user's product without being literal descriptions or industry jargon.

The trick: real brands evoke the FEELING of their field, not its vocabulary.
- Insurance brands (trust / shelter / foundation): Lemonade, Hippo, Root, Coalition, Coterie, Ladder, Pie.
- Payments brands (flow / settlement / clean): Stripe, Plaid, Brex, Ramp, Mercury.
- Productivity brands (thought / structure / motion): Notion, Linear, Asana, Coda, Roam.
- Health brands (vitality / care / life): Calm, Headspace, Oura, Ro, Hims.
- Communications (voice / channel): Slack, Loom, Discord, Twilio.

Notice none of those say "insurance", "payments", "productivity" etc. directly — they evoke a quality (shelter, flow, thought) associated with the field. That's the bullseye.

How to approach a name:
1. Read the description. Infer the field implicitly.
2. Identify the CORE VALUE that field promises (e.g. insurance → trust/safety; payments → speed/clarity; therapy → presence/calm).
3. Generate 4 names that EVOKE that value through metaphor — without using the field's vocabulary.

Output rules:
- Exactly 4 names, one per line. No numbering, quotes, explanation, surrounding text.
- 1 word ideally, 2 max as exception.
- Memorable, easy to spell, easy to say out loud, .com-friendly.
- MIX it up: at least 2 of the 4 should clearly evoke the field's core value via metaphor (e.g. for insurance: Shelter, Anchor, Haven). The other 1-2 can lean more abstract/coined.

Hard constraints:
- DO NOT reuse any noun from the user's description.
- DO NOT use the field's literal vocabulary. Insurance products: REJECT Insure, Claim, Policy, Coverage, Premium, Underwrite, Adjuster, Risk. Fitness: REJECT Train, Fit, Run, Pace. Etc.
- DO NOT use suffixes: AI, Tech, Lab, App, Cloud, Hub, Studio, Suite, OS, IO, .com, .ai.
- DO NOT use numbers or generic words (Project, App, Platform, Tool, System).

CRITICAL — existing brands are off-limits:
DO NOT suggest the name of any well-known software, SaaS, or consumer brand — including the inspiration examples I listed above (Lemonade, Stripe, Notion, etc. are illustrative; you must NOT use them as your suggestion). Before sending each name, mentally check: "Is this already a real product?" If yes, replace it.

Look for words like: Anchor, Beacon, Atlas, Harbor, Haven, Shelter, Pillar, Bedrock, Cornerstone, Sentinel, Lumen, Tide, Helm, Spire, Forge, Glide, Pulse, Lattice, Compass, Foundry, Crest, Sprout, Bloom, Quill, Aurora, Echo, Lumos, Vela, Nova, Sigma, Aero, Tessera, Mosaic.

Output ONLY the 4 names. Re-check each against your "is this a real product?" filter before sending.`;

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
 * Strip bullets/numbering, trim, drop empties + over-long lines, and
 * filter out names that collide with well-known software brands.
 * Returns at most 4 suggestions.
 *
 * The denylist is the last line of defence — the prompt should be doing
 * most of the work. Keep it focused on the most-likely collisions, not
 * exhaustive (an exhaustive list is impossible and not worth maintaining).
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
    .filter((line) => !BRAND_DENYLIST.has(line.toLowerCase()))
    .slice(0, 4);
}

/**
 * Lower-cased names of well-known software / SaaS / consumer-tech brands.
 * If a suggestion matches verbatim, drop it. The prompt should already
 * avoid these; this catches the residual.
 */
const BRAND_DENYLIST = new Set(
  [
    'notion', 'stripe', 'linear', 'vercel', 'figma', 'cal', 'plaid', 'asana',
    'ramp', 'brex', 'lattice', 'mercury', 'webflow', 'loom', 'pitch', 'sentry',
    'mux', 'lago', 'resend', 'retool', 'inngest', 'slack', 'zoom', 'discord',
    'twilio', 'datadog', 'heroku', 'auth0', 'clerk', 'mongodb', 'hubspot',
    'salesforce', 'quora', 'drift', 'velo', 'intercom', 'zendesk', 'airtable',
    'coda', 'miro', 'render', 'fly', 'railway', 'supabase', 'planetscale',
    'neon', 'cloudflare', 'anthropic', 'openai', 'replicate', 'pinecone',
    'chroma', 'cohere', 'perplexity', 'stream', 'pusher', 'ably', 'algolia',
    'mixpanel', 'segment', 'amplitude', 'posthog', 'launchdarkly', 'statsig',
    'persona', 'stytch', 'workos', 'trello', 'jira', 'confluence', 'basecamp',
    'monday', 'smartsheet', 'clickup', 'roam', 'obsidian', 'bear', 'craft',
    'tana', 'mem', 'github', 'gitlab', 'bitbucket', 'docker', 'kubernetes',
    'aws', 'gcp', 'azure', 'snowflake', 'databricks', 'tableau', 'looker',
    'apollo', 'gusto', 'rippling', 'deel', 'attio', 'pipedrive', 'monday',
    // Verticals — well-known consumer/SaaS brands beyond pure dev tools
    'lemonade', 'hippo', 'root', 'coalition', 'coterie', 'ladder', 'pie', 'acko',
    'wefox', 'next', 'oscar', 'bright', 'metromile', 'allstate', 'progressive',
    'calm', 'headspace', 'oura', 'whoop', 'strava', 'peloton', 'noom',
    'ro', 'hims', 'forward', 'tia', 'maven',
  ].map((s) => s.toLowerCase()),
);
