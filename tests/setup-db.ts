import { beforeEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { config } from 'dotenv';

config({
  path: '.env.test',
  override: true,
});

const prismaBin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
);

beforeEach(() => {
  execFileSync(
    prismaBin,
    ['db', 'push', '--force-reset', '--accept-data-loss'],
    {
      env: process.env,
      stdio: 'ignore',
    },
  );
});
