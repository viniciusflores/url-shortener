import { beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { config } from 'dotenv';

// 1. Load the test database URL
config({ path: '.env.test' });

beforeEach(() => {
  try {
    execSync('npx prisma db push --force-reset --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdio: 'ignore',
    });
  } catch (error) {
    console.error('❌ Database reset failed. See Prisma error above.');
    throw error;
  }
});
