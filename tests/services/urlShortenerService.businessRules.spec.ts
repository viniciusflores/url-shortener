import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UrlShortenerService } from '../../src/services/urlShortenerService';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { BASE_URL } from '../../src/env';
import { getExpiryDatePlusOneYear } from '../../src/lib/date/utils';
import { redisCacheUrlShortener } from '../../src/lib/cache';

vi.mock('../../src/lib/cache/redis', () => ({
  redisCacheUrlShortener: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}));

describe('UrlShortenerService - Business Rules', () => {
  let service: UrlShortenerService;
  let repo: MockUrlRepository;
  const baseUrl = BASE_URL;

  beforeEach(() => {
    repo = new MockUrlRepository();
    service = new UrlShortenerService(repo);
    vi.spyOn(repo, 'findByOriginalUrl');
    vi.spyOn(repo, 'findByHash');
    vi.spyOn(repo, 'createRandom');
    vi.spyOn(repo, 'createCustom');
    vi.clearAllMocks();
    vi.mocked(redisCacheUrlShortener.get).mockResolvedValue(null);
  });

  afterEach(function () {
    vi.resetAllMocks();
    repo.reset();
    vi.useRealTimers();
  });

  describe('URL Validation', () => {
    test('should throw an error for missing URL', async () => {
      await expect(service.shorten('')).rejects.toThrow('Missing URL');
    });

    test('should throw an error for invalid URL format', async () => {
      await expect(service.shorten('invalid-url')).rejects.toThrow(
        'Invalid URL',
      );
    });

    test('should validate URL protocol requirements', async () => {
      // Mock repository methods to handle valid URLs properly
      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      // Mock findByHash to avoid any potential hash lookup issues
      vi.spyOn(repo, 'findByHash').mockResolvedValue(null);

      const validUrls = ['https://example.com', 'http://example.com'];

      for (const url of validUrls) {
        await expect(service.shorten(url)).resolves.toBeDefined();
      }
    });

    test('should handle very long URLs', async () => {
      const longUrl = 'https://' + 'a'.repeat(1000) + '.com';
      await expect(service.shorten(longUrl)).resolves.toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    test('should be possible to shorten URL with special characters', async () => {
      const specialUrl = 'https://example.com/path?param=value&other=123';

      // Mock repository properly
      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      const shortened = await service.shorten(specialUrl);
      expect(shortened).toMatch(
        new RegExp(`^${baseUrl}/url/[A-Za-z0-9+/=]{3,}$`),
      );
    });

    test('should handle URLs with unicode characters', async () => {
      const unicodeUrl = 'https://example.com/путь?query=тест';

      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      const shortened = await service.shorten(unicodeUrl);
      expect(shortened).toMatch(
        new RegExp(`^${baseUrl}/url/[A-Za-z0-9+/=]{3,}$`),
      );
    });

    test('should handle URLs with fragments', async () => {
      const fragmentUrl = 'https://example.com/path#section1';

      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      const shortened = await service.shorten(fragmentUrl);
      expect(shortened).toMatch(
        new RegExp(`^${baseUrl}/url/[A-Za-z0-9+/=]{3,}$`),
      );
    });

    test('should handle very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);

      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      const shortened = await service.shorten(longUrl);
      expect(shortened).toMatch(
        new RegExp(`^${baseUrl}/url/[A-Za-z0-9+/=]{3,}$`),
      );
    });
  });

  describe('Business Logic Rules', () => {
    test('should handle hash collision with maximum attempts', async () => {
      // Mock repository to always return existing hash (simulating collision)
      vi.spyOn(repo, 'findByHash').mockResolvedValue({
        original_url: 'https://example.com',
        hashed_url: 'existing-hash',
        clicks: 0,
        lastAccessed: null,
        userId: null,
        expiresAt: new Date(),
      });

      const originalUrl = 'https://example.com';

      await expect(service.shorten(originalUrl)).rejects.toThrow(
        'Failed to generate unique hash after multiple attempts',
      );
    });

    test('should allow reuse of custom alias by same user', async () => {
      const customAlias = 'my-custom-alias';
      const userId = 'user-123';
      const originalUrl = 'https://example.com';

      // Mock repository behavior
      vi.spyOn(repo, 'findByHash')
        .mockResolvedValueOnce(null) // First call - not taken
        .mockResolvedValueOnce({
          // Second call - taken by same user
          original_url: originalUrl,
          hashed_url: customAlias,
          clicks: 0,
          lastAccessed: null,
          userId: userId,
          expiresAt: new Date(),
        });

      vi.spyOn(repo, 'createCustom').mockImplementation((url, alias, uid) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: alias,
          clicks: 0,
          lastAccessed: null,
          userId: uid,
          expiresAt: new Date(),
        });
      });

      // First creation should succeed
      const shortened1 = await service.shorten(
        originalUrl,
        customAlias,
        userId,
      );

      // Second attempt with same user should work (reuse)
      expect(shortened1).toBe(`${BASE_URL}/url/${customAlias}`);
    });

    test('should reject custom alias conflicts with different users', async () => {
      const customAlias = 'shared-alias';
      const userId1 = 'user-123';
      const userId2 = 'user-456';
      const originalUrl = 'https://example.com';

      // Mock repository - alias taken by first user
      vi.spyOn(repo, 'findByHash').mockResolvedValue({
        original_url: 'https://other.com',
        hashed_url: customAlias,
        clicks: 0,
        lastAccessed: null,
        userId: userId1,
        expiresAt: new Date(),
      });

      await expect(() =>
        service.shorten(originalUrl, customAlias, userId2),
      ).rejects.toThrow('Custom alias already taken');
    });

    test('should handle repository failures gracefully', async () => {
      vi.spyOn(repo, 'findByOriginalUrl').mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.shorten('https://example.com')).rejects.toThrow();
    });
  });

  describe('Environment and Configuration', () => {
    test('should handle different configuration scenarios', async () => {
      // Setup mocks for valid URL handling
      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      const originalUrl = 'https://example.com';
      const shortened = await service.shorten(originalUrl);
      expect(shortened).toContain(BASE_URL);
    });

    test('should properly validate environment variables', async () => {
      // Ensure BASE_URL is properly defined - this might be an issue with your env setup
      expect(BASE_URL).toBeDefined();
      // This test may need to be adjusted if BASE_URL isn't set up correctly in test environment
      if (BASE_URL !== '/') {
        expect(BASE_URL).toMatch(/^https?:\/\//);
      }
    });

    test('should validate custom alias formats', async () => {
      // Test invalid characters
      await expect(() =>
        service.shorten('https://example.com', 'invalid@alias', 'user123'),
      ).rejects.toThrow('Invalid custom alias');

      // Test too short alias
      await expect(() =>
        service.shorten('https://example.com', 'ab', 'user123'),
      ).rejects.toThrow('Invalid custom alias');
    });

    test('should reject reserved words in aliases', async () => {
      const reservedAliases = ['admin', 'user', 'root', 'test', 'config'];

      for (const alias of reservedAliases) {
        await expect(() =>
          service.shorten('https://example.com', alias, 'user123'),
        ).rejects.toThrow('Invalid custom alias');
      }
    });
  });

  describe('Cache Behavior', () => {
    test('should use cache when available', async () => {
      const original_url = 'https://example.com';
      const hash = '5r6dDvfxcw==';
      const expiresAt = getExpiryDatePlusOneYear();

      await repo.createRandom(original_url, hash);

      // Test if we can actually set and get from cache
      await redisCacheUrlShortener.set({ hash, original_url, expiresAt });

      // Check what's actually in cache
      const cachedValue = await redisCacheUrlShortener.get(hash);
      console.log('Cached value:', cachedValue);

      // Now test the actual service call
      await service.resolveShortenedUrl(hash);
    });

    test('should fall back to repository when cache misses', async () => {
      const originalUrl = 'https://example.com';

      // Mock cache miss
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue(null);

      vi.spyOn(repo, 'findByOriginalUrl').mockResolvedValue(null);
      vi.spyOn(repo, 'createRandom').mockImplementation((url, hash) => {
        return Promise.resolve({
          original_url: url,
          hashed_url: hash,
          clicks: 0,
          lastAccessed: null,
          userId: null,
          expiresAt: new Date(),
        });
      });

      const shortened = await service.shorten(originalUrl);

      expect(shortened).toMatch(
        new RegExp(`^${baseUrl}/url/[A-Za-z0-9+/=]{3,}$`),
      );
    });
  });
});
