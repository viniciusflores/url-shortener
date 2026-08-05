import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Env Schema Validation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('deve passar se todas as variáveis obrigatórias estiverem presentes', async () => {
    process.env.BASE_URL = 'http://localhost';
    process.env.JWT_SECRET = 'supersecret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.DB_POSTGRES_USER = 'user';
    process.env.DB_POSTGRES_PASSWORD = 'pwd';
    process.env.DB_POSTGRES_DB = 'db';
    process.env.DATABASE_URL = 'postgres://...';
    process.env.DB_POSTGRES_USER_TEST = 'user';
    process.env.DB_POSTGRES_PASSWORD_TEST = 'pwd';
    process.env.DB_POSTGRES_DB_TEST = 'db_test';
    process.env.DATABASE_URL_TEST = 'postgres://...';

    const env = await import('../../src/env');

    expect(env.BASE_URL).toBe('http://localhost');
  });

  it('deve lançar um erro se faltarem variáveis obrigatórias', async () => {
    vi.stubEnv('BASE_URL', '');
    delete process.env.JWT_SECRET;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(import('../../src/env')).rejects.toThrow(
      'Invalid environment variables.',
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('❌ Invalid environment variables.'),
      expect.any(Object),
    );

    consoleSpy.mockRestore();
  });
});
