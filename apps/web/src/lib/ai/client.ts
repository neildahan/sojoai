import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';

/**
 * Single shared Anthropic SDK client. Server-only — never import from a client component.
 *
 * The `'server-only'` import will throw at build time if anything in the client
 * bundle pulls this in.
 */

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to .env.local — see apps/web/.env.example.',
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}
