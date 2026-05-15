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

const SYSTEM_PROMPT = `You name early-stage software products in a CLEAR, DESCRIPTIVE style. The goal: a name that immediately tells the user what the product is about.

Think of this style: Mailchimp (email + chimp), Calendly (calendar), Zapier (zap), Grammarly (grammar), DocuSign (docs + sign), TaskRabbit (tasks), QuickBooks (books), HubSpot (hub), Squarespace (squares + space), Dropbox (drop + box). These names succeed BECAUSE they contain industry vocabulary — they reveal the product on first read.

Your approach for every suggestion:

1. Read the description. Identify three building blocks:
   - FIELD (e.g. insurance, fitness, legal, education)
   - USER ROLE or OBJECT (e.g. agent, broker, claim, policy, student)
   - ACTION (e.g. automate, sign, manage, track, write)

2. Combine those building blocks with familiar SaaS-naming patterns:
   - [Field/Role] + [Me/AI/Bot/Pilot/Pro/Wise/Flow/Hub]: InsureMe, PolicyPilot, AgentBot, ClaimWise, BrokerHub, AgentAI.
   - [Action] + [Field/Role]: AutoInsure, SmartPolicy, FlowClaim, QuickBroker.
   - [Field] + [-ify / -ly]: Insurify (used — pick a different pattern), Claimly.
   - Portmanteau of two relevant words: AgentForge, PolicyForge, ClaimMate, InsureMate.

3. Each name should clearly relate to the description. If a name doesn't reveal what the product is about, REJECT IT.

Output rules:
- Exactly 4 names, one per line. No numbering, quotes, explanation, no surrounding text.
- 1 word combined (CamelCase counts as one), or 2 words max.
- Easy to read, easy to type.

Vary the 4 suggestions:
- Suggestion 1: heavy on the field word — e.g. InsureMe, InsureBot.
- Suggestion 2: combines the role with an action/utility — e.g. AgentPilot, BrokerFlow.
- Suggestion 3: combines an action verb with the field — e.g. AutoInsure, SmartPolicy.
- Suggestion 4: a creative portmanteau still rooted in the field — e.g. PolicyMate, ClaimGenie.

CRITICAL — avoid existing brands:
DO NOT propose names of existing well-known software (Mailchimp, Calendly, Zapier, Grammarly, DocuSign, TaskRabbit, QuickBooks, HubSpot, Squarespace, Dropbox, Insurify, Lemonade, etc. are illustrative — they're TAKEN, do NOT suggest them). Before sending each name, mentally check: "Is this already a real product?" If yes, swap it.

Output ONLY the 4 names. Each must clearly relate to the user's description.`;

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
    // Descriptive-style SaaS brands cited as inspiration
    'mailchimp', 'calendly', 'zapier', 'grammarly', 'docusign', 'taskrabbit',
    'quickbooks', 'hubspot', 'squarespace', 'dropbox', 'insurify', 'policygenius',
    'turbotax', 'docsend', 'pdfmonkey', 'shipstation', 'shippo', 'sendgrid',
    'mailgun', 'postmark', 'lemlist', 'apollo', 'gong', 'chorus', 'outreach',
    'salesloft', 'metabase', 'hex', 'mode', 'omni', 'preset',
  ].map((s) => s.toLowerCase()),
);
