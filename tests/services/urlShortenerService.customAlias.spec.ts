import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UrlShortenerService } from '../../src/services/urlShortenerService';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { BASE_URL } from '../../src/env';

describe('UrlShortenerService - custom alias tests', () => {
  let service: UrlShortenerService;
  let repo: MockUrlRepository;
  const baseUrl = BASE_URL;

  beforeEach(() => {
    repo = new MockUrlRepository();
    service = new UrlShortenerService(repo);
    vi.clearAllMocks();
  });

  afterEach(function () {
    vi.resetAllMocks();
    repo.reset();
    vi.useRealTimers();
  });

  test('should be able to create a custom url with alias', async () => {
    const customAlias = 'my-custom-alias';
    const userId = 'user-123';
    const originalUrl = 'https://example.com';

    const shortenedUrl = await service.shorten(
      originalUrl,
      customAlias,
      userId,
    );

    expect(shortenedUrl).toBe(`${baseUrl}/url/${customAlias}`);

    const record = await repo.findByHash(customAlias);
    expect(record).not.toBeNull();
    expect(record?.original_url).toBe(originalUrl);
    expect(record?.hashed_url).toBe(customAlias);
    expect(record?.userId).toBe(userId);
    expect(record?.expiresAt).toBeInstanceOf(Date);
  });

  test('should not be able to create a custom url with alias already been taken', async () => {
    const customAlias = 'my-custom-alias';
    const userId = 'user-123';
    const originalUrl = 'https://example.com';

    const shortenedUrl = await service.shorten(
      originalUrl,
      customAlias,
      userId,
    );

    expect(shortenedUrl).toBe(`${baseUrl}/url/${customAlias}`);

    // Second attempt with same user should also work (allowing reuse)
    await expect(() =>
      service.shorten(originalUrl, customAlias, userId),
    ).rejects.toThrow('Custom alias already taken');
  });

  test('should throw an error when try to create custom alias without userId', async () => {
    await expect(() =>
      service.shorten('https://example.com', 'my-custom-alias', ''),
    ).rejects.toThrow('Invalid user ID');
  });

  test('should throw an error when try to create custom alias without customAlias', async () => {
    await expect(() =>
      service.shorten('https://example.com', '', 'user0123'),
    ).rejects.toThrow('Invalid custom alias');
  });

  test('should reject reserved words in custom aliases', async () => {
    const reservedAliases = ['login', 'admin', 'api', 'health', 'test'];

    for (const alias of reservedAliases) {
      await expect(() =>
        service.shorten('https://example.com', alias, 'user123'),
      ).rejects.toThrow('Invalid custom alias');
    }
  });

  test('should handle custom alias conflicts with different users', async () => {
    const customAlias = 'shared-alias';
    const userId1 = 'user-123';
    const userId2 = 'user-456';
    const originalUrl = 'https://example.com';

    // First user creates the alias
    await service.shorten(originalUrl, customAlias, userId1);

    // Second user should not be able to use same alias
    await expect(() =>
      service.shorten(originalUrl, customAlias, userId2),
    ).rejects.toThrow('Custom alias already taken');
  });

  test('should properly validate alias length and format', async () => {
    // Test too short alias
    await expect(() =>
      service.shorten('https://example.com', 'ab', 'user123'),
    ).rejects.toThrow('Invalid custom alias');

    // Test invalid characters
    await expect(() =>
      service.shorten('https://example.com', 'alias@123', 'user123'),
    ).rejects.toThrow('Invalid custom alias');
  });
});
