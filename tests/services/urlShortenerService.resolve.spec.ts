import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UrlShortenerService } from '../../src/services/urlShortenerService';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { generateHash } from '../../src/lib/crypto';
import {
  getExpiredDate,
  getExpiryDatePlusOneYear,
} from '../../src/lib/date/utils';
import { redisCacheUrlShortener } from '../../src/lib/cache';

vi.mock('../../src/lib/cache/redis', () => ({
  redisCacheUrlShortener: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}));

describe('UrlShortenerService - resolve url flow', () => {
  let service: UrlShortenerService;
  let repo: MockUrlRepository;
  const sample_url = 'http://www.google.com';
  const sample_hashed = 'abcdef';
  const sample_custom_alias = 'my-custom-alias';
  const sample_user_id = 'user-123';

  async function createDefaultRandomUrlShortener(data: any = {}) {
    const url = data.url ? data.url : sample_url;
    const hashed = data.hashed ? data.hashed : sample_hashed;
    const randomUrl = await repo.createRandom(url, hashed);
    return randomUrl;
  }

  async function createDefaultCustomUrlShortener(data: any = {}) {
    const url = data.url ? data.url : sample_url;
    const customAlias = data.customAlias
      ? data.customAlias
      : sample_custom_alias;
    const userId = data.userId ? data.userId : sample_user_id;
    const customUrl = await repo.createCustom(url, customAlias, userId);
    return customUrl;
  }

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

  describe('resolveShortenedUrl with database', () => {
    test('should resolve a random shortened url to the original url', async () => {
      await createDefaultRandomUrlShortener();
      const resolvedUrl = await service.resolveShortenedUrl(sample_hashed);

      expect(resolvedUrl).toEqual({
        original_url: sample_url,
        expiresAt: expect.any(Date),
      });
    });

    test('should resolve a custom shortened url to the original url', async () => {
      await createDefaultCustomUrlShortener();
      const resolvedUrl =
        await service.resolveShortenedUrl(sample_custom_alias);

      expect(resolvedUrl).toEqual({
        original_url: sample_url,
        expiresAt: expect.any(Date),
      });
    });
  });

  test('should handle invalid hash formats properly', async () => {
    // Test empty string
    await expect(service.resolveShortenedUrl('')).rejects.toThrow(
      'Invalid hash format provided',
    );

    // Test null/undefined
    await expect(service.resolveShortenedUrl(null as any)).rejects.toThrow(
      'Invalid hash format provided',
    );

    // Test whitespace only
    await expect(service.resolveShortenedUrl(' ')).rejects.toThrow(
      'Invalid hash format provided',
    );

    // Test invalid characters (like single character)
    await expect(service.resolveShortenedUrl('x')).rejects.toThrow(
      'Invalid hash format provided',
    );

    // Test reserved words
    await expect(service.resolveShortenedUrl('login')).rejects.toThrow(
      'Invalid hash format provided',
    );
    await expect(service.resolveShortenedUrl('api')).rejects.toThrow(
      'Invalid hash format provided',
    );
    await expect(service.resolveShortenedUrl('health')).rejects.toThrow(
      'Invalid hash format provided',
    );

    // Test malformed URLs
    await expect(service.resolveShortenedUrl('/?url=all')).rejects.toThrow(
      'Invalid hash format provided',
    );
  });

  test('should throw an error if the hash does not exist', async () => {
    await expect(service.resolveShortenedUrl('nonexistent')).rejects.toThrow(
      'URL not found',
    );
  });

  test('should throw an error when url is expired', async () => {
    const originalUrl = 'https://example.com';
    const hash = generateHash();
    const my_url = await repo.createRandom(originalUrl, hash);

    const expiredTime = getExpiredDate();
    my_url.expiresAt = expiredTime;

    await expect(service.resolveShortenedUrl(hash)).rejects.toThrow(
      'The requested resource is no longer available on this server and is permanently removed.',
    );
  });

  describe('Resolve shortener URL with redis cache', () => {
    test('returns url from cache on hit, without touching the repo for lookup', async () => {
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue({
        original_url: 'https://example.com',
        expiresAt: getExpiryDatePlusOneYear(),
      });

      // Mock repo.findByHash to be a spy
      const findByHashSpy = vi
        .spyOn(repo, 'findByHash')
        .mockResolvedValue(null);

      const hash = generateHash();
      await repo.createRandom('https://example.com', hash);

      const result = await service.resolveShortenedUrl(hash);

      expect(result).toEqual({
        original_url: 'https://example.com',
        expiresAt: expect.any(Date),
      });
      expect(findByHashSpy).not.toHaveBeenCalled();
    });

    test('invalidates cache and throws when cached entry is expired', async () => {
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue({
        original_url: 'https://example.com',
        expiresAt: getExpiredDate(),
      });

      await expect(service.resolveShortenedUrl('abc123')).rejects.toThrow(
        'The requested resource is no longer available on this server and is permanently removed.',
      );

      expect(redisCacheUrlShortener.invalidate).toHaveBeenCalledWith('abc123');
    });

    test('populates cache on miss when repo returns a valid record', async () => {
      const hash = generateHash();
      await repo.createRandom('https://example.com', hash);

      await service.resolveShortenedUrl(hash);

      expect(redisCacheUrlShortener.set).toHaveBeenCalledWith(
        expect.objectContaining({ hash, original_url: 'https://example.com' }),
      );
    });

    test('should not populate cache when repo returns null', async () => {
      vi.spyOn(repo, 'findByHash').mockResolvedValue(null);
      await expect(
        service.resolveShortenedUrl('nonexistent'),
      ).rejects.toThrow();
      expect(redisCacheUrlShortener.set).not.toHaveBeenCalled();
    });

    test('should handle complete flow: shorten → resolve → cache interaction', async () => {
      const originalUrl = 'https://example.com/test';

      // Shorten URL
      const shortened = await service.shorten(originalUrl);

      // Resolve it (should hit cache on second call)
      await service.resolveShortenedUrl(shortened.split('/').pop()!);
      await service.resolveShortenedUrl(shortened.split('/').pop()!);

      // Verify cache behavior
      expect(redisCacheUrlShortener.get).toHaveBeenCalledTimes(2);
    });

    test('should handle custom alias with cache properly', async () => {
      // Create custom URL
      await createDefaultCustomUrlShortener();

      // Mock cache hit
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue({
        original_url: sample_url,
        expiresAt: getExpiryDatePlusOneYear(),
      });

      const findByHashSpy = vi.spyOn(repo, 'findByHash');

      const result = await service.resolveShortenedUrl(sample_custom_alias);

      expect(result).toEqual({
        original_url: sample_url,
        expiresAt: expect.any(Date),
      });

      // Should not call repo when cache hit
      expect(findByHashSpy).not.toHaveBeenCalled();
    });

    test('should handle expired cached entry properly', async () => {
      // Mock expired cache entry
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue({
        original_url: sample_url,
        expiresAt: getExpiredDate(),
      });

      const invalidateSpy = vi.spyOn(redisCacheUrlShortener, 'invalidate');

      await expect(service.resolveShortenedUrl(sample_hashed)).rejects.toThrow(
        'The requested resource is no longer available on this server and is permanently removed.',
      );

      expect(invalidateSpy).toHaveBeenCalledWith(sample_hashed);
    });
  });
});
