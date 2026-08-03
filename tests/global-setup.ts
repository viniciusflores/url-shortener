import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';

const envTestPath = '.env.test';

if (!existsSync(envTestPath)) {
  throw new Error(
    `Environment file "${envTestPath}" not found.\nPlease create it with your test database configuration.`,
  );
}

// Load only here to execute Prisma commands
const result = config({ path: envTestPath });

if (result.error) {
  throw result.error;
}

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

export default async function globalSetup() {
  execFileSync(prismaBin, ['generate'], {
    env: process.env,
    stdio: 'ignore',
  });

  execFileSync(prismaBin, ['db', 'push'], {
    env: process.env,
    stdio: 'ignore',
  });
}
