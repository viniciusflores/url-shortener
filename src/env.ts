import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  BASE_URL: z.string(),
  APP_PORT: z.coerce.number().default(3000),
  HASH_STRONG_NUMBER: z.coerce.number().default(7),
  HASH_PASSWORD: z.coerce.number().default(10),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  DB_POSTGRES_IMAGE_NAME: z.string().default('postgres:18.4-alpine'),
  DB_POSTGRES_USER: z.string(),
  DB_POSTGRES_PASSWORD: z.string(),
  DB_POSTGRES_PORT: z.coerce.number().default(5432),
  DB_POSTGRES_DB: z.string(),
  DATABASE_URL: z.string(),
  DB_POSTGRES_USER_TEST: z.string(),
  DB_POSTGRES_PASSWORD_TEST: z.string(),
  DB_POSTGRES_PORT_TEST: z.coerce.number().default(5433),
  DB_POSTGRES_DB_TEST: z.string(),
  DATABASE_URL_TEST: z.string(),
  REDIS_IMAGE: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_URL: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables.', _env.error.format());

  throw new Error('Invalid environment variables.');
}

export const {
  APP_PORT,
  BASE_URL,
  DATABASE_URL,
  DATABASE_URL_TEST,
  DB_POSTGRES_DB,
  DB_POSTGRES_DB_TEST,
  DB_POSTGRES_IMAGE_NAME,
  DB_POSTGRES_PASSWORD,
  DB_POSTGRES_PASSWORD_TEST,
  DB_POSTGRES_PORT,
  DB_POSTGRES_PORT_TEST,
  DB_POSTGRES_USER,
  DB_POSTGRES_USER_TEST,
  HASH_PASSWORD,
  HASH_STRONG_NUMBER,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NODE_ENV,
  REDIS_IMAGE,
  REDIS_PORT,
  REDIS_URL,
} = _env.data;
