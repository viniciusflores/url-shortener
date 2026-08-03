import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { validateAndSanitizeEnv } from './utils/validate-env.ts';

export default defineConfig(({ mode }) => {
  // 1. Load the .env file fields using Vite's native loader
  const rawEnv = loadEnv(mode, process.cwd(), '');

  // 2. Delegate validation and sanitization to the helper module
  const sanitizedEnv = validateAndSanitizeEnv(rawEnv);

  return {
    test: {
      include: ['test/**/*.test.ts'],
      testTimeout: 10000,
      // 3. Inject validated variables cleanly into isolated worker test threads
      env: {
        BASE_URL: sanitizedEnv.BASE_URL,
      },
    },
  };
});
