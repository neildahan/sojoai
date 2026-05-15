import { z } from 'zod';

/**
 * All environment variables are parsed once, at module load.
 * - Server-only vars are validated only on the server.
 * - `NEXT_PUBLIC_*` vars are inlined at build time and validated on both sides.
 *
 * Never read `process.env.X` ad-hoc. Import `env` from here.
 * If validation fails, the app fails to boot — exactly what we want.
 */

const isServer = typeof window === 'undefined';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ── AI ──
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // ── DB ──
  MONGODB_URI: z.string().url().optional(),

  // ── Auth (Clerk) ──
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // ── Email ──
  RESEND_API_KEY: z.string().optional(),

  // ── Payments ──
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
});

const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

const serverEnv = isServer ? serverSchema.parse(process.env) : ({} as z.infer<typeof serverSchema>);

export const env = {
  ...clientEnv,
  ...serverEnv,
};

export type Env = typeof env;
