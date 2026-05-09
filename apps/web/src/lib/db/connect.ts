import 'server-only';
import mongoose, { type Mongoose } from 'mongoose';
import { env } from '@/lib/env';

/**
 * MongoDB connection helper. Caches the connection across hot reloads in dev
 * and across serverless invocations in prod (Next.js can re-import this module
 * many times per cold-start).
 */

interface CachedConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalForMongo = globalThis as unknown as { __mongo?: CachedConnection };
const cached: CachedConnection = globalForMongo.__mongo ?? { conn: null, promise: null };
globalForMongo.__mongo = cached;

export async function connectDb(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local — see .env.example.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
