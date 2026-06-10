import 'dotenv/config';
import type { RootHookObject } from 'mocha';

const { BASE_URL } = process.env;

export const mochaHooks = async function (): Promise<RootHookObject> {
  return {
    beforeAll: [
      async function () {
        if (!BASE_URL) {
          console.error('BASE_URL environment variable is not set.');
          process.exit(1);
        }
      },
    ],
  };
};
