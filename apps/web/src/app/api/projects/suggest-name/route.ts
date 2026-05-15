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

CRITICAL — Avoid existing brands:
DO NOT suggest the name of any existing well-known software, SaaS, or consumer brand. Before you write each name, mentally verify: "Is this already an existing software company, app, framework, or consumer product?" If yes, REPLACE IT.

Known software brands you MUST NOT propose (non-exhaustive, treat as forbidden):
Notion, Stripe, Linear, Vercel, Figma, Cal, Plaid, Asana, Ramp, Brex, Lattice, Mercury, Webflow, Loom, Pitch, Sentry, Mux, Lago, Resend, Retool, Inngest, Slack, Zoom, Discord, Twilio, Datadog, Heroku, Auth0, Clerk, MongoDB, Hubspot, Salesforce, Quora, Drift, Velo, Intercom, Zendesk, Airtable, Coda, Miro, Linear, Stripe, Render, Fly, Railway, Supabase, PlanetScale, Neon, Cloudflare, Anthropic, OpenAI, Replicate, Hugging, Pinecone, Weights, Chroma, Cohere, Perplexity, Crystal, Stream, Pusher, Ably, Algolia, Mixpanel, Segment, Amplitude, PostHog, LaunchDarkly, Statsig, Persona, Stytch, WorkOS, Trello, Jira, Confluence, Basecamp, Monday, Smartsheet, ClickUp, Coda, Roam, Obsidian, Bear, Craft, Tana, Mem.

The list above is incomplete — use general knowledge. If a name sounds even vaguely familiar from another product, replace it.

Pull from: short evocative words (Beacon, Anchor, Pulse, Glide, Forge, Spire, Tide, Helm, Atlas, Harbor), coined/portmanteau (made-up but pronounceable), Latin/Greek roots (Lex, Vox, Nova, Aero, Sigma, Astra, Lumen), or repurposed words. The treasure is in coined words that don't yet have brand owners.

Output ONLY the 4 names. After generating, mentally re-check each: is it an existing software brand? If yes, replace before sending.`;

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
  ].map((s) => s.toLowerCase()),
);
