import { beforeAll, beforeEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const envTestPath = '.env.test';

if (!existsSync(envTestPath)) {
  throw new Error(
    `Environment file "${envTestPath}" not found.\nPlease create it with your test database configuration.`,
  );
}

// Load test environment variables
config({ path: envTestPath });

// Local Prisma executable
const prismaBin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
);

if (!existsSync(prismaBin)) {
  throw new Error(
    `Prisma executable not found at "${prismaBin}".\nDid you run "yarn install"?`,
  );
}

// Environment passed to Prisma
const prismaEnv = {
  ...process.env,
};

function runPrisma(args: string[]) {
  execFileSync(prismaBin, args, {
    env: prismaEnv,
    stdio: 'ignore',
  });
}

beforeAll(() => {
  try {
    runPrisma(['db', 'pull']);
  } catch (error) {
    throw new Error(
      'Database is not running.\nRun:\n\ndocker compose --env-file=.env up -d',
      { cause: error },
    );
  }
});

beforeEach(() => {
  runPrisma(['db', 'push', '--force-reset', '--accept-data-loss']);
});
