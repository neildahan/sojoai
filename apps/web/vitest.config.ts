import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for @sojoai/web.
 * - `node` env keeps tests fast for now (pure-function tests only).
 * - Switch to `jsdom` when we add React Testing Library for component tests.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: false,
  },
});
