import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { UserRecord } from '../../src/repositories/interfaces/userRepository';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { MockUserRepository } from '../../src/repositories/mock/mockUserRepo';
import { MockClickEventRepository } from '../../src/repositories/mock/mockClickEventRepo';
import { UrlManagementService } from '../../src/services/urlManagementService';
import { redisCacheUrlShortener } from '../../src/lib/cache';

vi.mock('../../src/lib/cache/redis', () => ({
  redisCacheUrlShortener: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}));

describe('UrlManagementService', () => {
  let service: UrlManagementService;
  let repoUrl: MockUrlRepository;
  let repoUsers: MockUserRepository;
  let repoClicks: MockClickEventRepository;
  const user_default = 'email@email.com';
  const password_hashed_default = '1234567890';
  let user: UserRecord;
  let originalUrl: string;
  let customAlias: string;
  let newCustomAlias: string;

  beforeEach(async () => {
    repoUrl = new MockUrlRepository();
    repoUsers = new MockUserRepository();
    repoClicks = new MockClickEventRepository();
    service = new UrlManagementService(repoUrl, repoUsers, repoClicks);
    user = await repoUsers.create(user_default, password_hashed_default);
    originalUrl = 'http://www.google.com';
    customAlias = 'google';
    newCustomAlias = 'newGoogle';
    await repoUrl.createCustom(originalUrl, customAlias, user.id);
  });

  afterEach(function () {
    vi.resetAllMocks();
    repoUrl.reset();
    repoUsers.reset();
    repoClicks.reset();
  });

  describe('Show my urls', async () => {
    test('should be possible to show my urls', async () => {
      const urls = await service.showMyUrls(user.id);
      expect(urls).toBeInstanceOf(Array);
      expect(urls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            original_url: expect.any(String),
            hashed_url: expect.any(String),
            userId: expect.any(String),
          }),
        ]),
      );
    });

    test('should return the clicks count of each url from click events', async () => {
      await repoUrl.createCustom(originalUrl, 'unclicked', user.id);
      await repoClicks.create(customAlias, '127.0.0.1', 'Chrome');
      await repoClicks.create(customAlias, '127.0.0.1', 'Firefox');

      const urls = await service.showMyUrls(user.id);

      expect(urls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ hashed_url: customAlias, clicks: 2 }),
          expect.objectContaining({ hashed_url: 'unclicked', clicks: 0 }),
        ]),
      );
    });

    test('should not be possible to show my urls without userId', async () => {
      await expect(service.showMyUrls('')).rejects.toThrow('Invalid user ID');
    });

    test('should not be possible to show my urls without existing user', async () => {
      await expect(service.showMyUrls('123')).rejects.toThrow('User not found');
    });
  });

  describe('show my urls by hash', async () => {
    test('should be possible to show my url by hash', async () => {
      const url = await service.showMyUrlByHash(user.id, customAlias);
      expect(url).toEqual(
        expect.objectContaining({
          original_url: originalUrl,
        }),
      );
    });

    test('should return the clicks count of the url from click events', async () => {
      await repoClicks.create(customAlias, '127.0.0.1', 'Chrome');
      await repoClicks.create('other-hash', '127.0.0.1', 'Chrome');

      const url = await service.showMyUrlByHash(user.id, customAlias);

      expect(url).toEqual(
        expect.objectContaining({ hashed_url: customAlias, clicks: 1 }),
      );
    });

    test('should not be possible to show my url by hash without userId', async () => {
      await expect(service.showMyUrlByHash('', '123')).rejects.toThrow(
        'Invalid user ID',
      );
    });

    test('should not be possible to show my url by hash without hash', async () => {
      await expect(service.showMyUrlByHash('123', '')).rejects.toThrow(
        'Invalid hash',
      );
    });

    test('should not be possible to show my url by hash without existing user', async () => {
      await expect(service.showMyUrlByHash('123', customAlias)).rejects.toThrow(
        'User not found',
      );
    });

    test('should not be possible to show my url by hash without existing url', async () => {
      await expect(service.showMyUrlByHash(user.id, '123')).rejects.toThrow(
        'Url not found',
      );
    });
  });

  describe('update alias', async () => {
    test('should be possible to update alias', async () => {
      const url = await service.updateAlias(
        user.id,
        customAlias,
        newCustomAlias,
      );
      expect(url).toEqual(
        expect.objectContaining({
          original_url: originalUrl,
          hashed_url: newCustomAlias,
        }),
      );
    });

    test('should invalidate the old alias cache only after the database update', async () => {
      const updateAliasSpy = vi.spyOn(repoUrl, 'updateAlias');

      await service.updateAlias(user.id, customAlias, newCustomAlias);

      expect(redisCacheUrlShortener.invalidate).toHaveBeenCalledWith(
        customAlias,
      );
      expect(updateAliasSpy.mock.invocationCallOrder[0]).toBeLessThan(
        vi.mocked(redisCacheUrlShortener.invalidate).mock
          .invocationCallOrder[0],
      );
    });

    test('should not invalidate the cache when the database update fails', async () => {
      vi.spyOn(repoUrl, 'updateAlias').mockRejectedValue(new Error('db down'));

      await expect(
        service.updateAlias(user.id, customAlias, newCustomAlias),
      ).rejects.toThrow('db down');
      expect(redisCacheUrlShortener.invalidate).not.toHaveBeenCalled();
    });

    test('should not be possible to update alias without userId', async () => {
      await expect(service.updateAlias('', '', '')).rejects.toThrow(
        'Invalid user ID',
      );
    });

    test('should not be possible to update alias without hash', async () => {
      await expect(service.updateAlias('123', '', '')).rejects.toThrow(
        'Invalid hash',
      );
    });

    test('should not be possible to update alias without new alias', async () => {
      await expect(service.updateAlias('123', '123', '')).rejects.toThrow(
        'Invalid new alias',
      );
    });

    test('should not be possible to update alias without existing user', async () => {
      await expect(service.updateAlias('123', '123', '123')).rejects.toThrow(
        'User not found',
      );
    });

    test('should not be possible to update alias existing url', async () => {
      await expect(service.updateAlias(user.id, '123', '123')).rejects.toThrow(
        'Url not found',
      );
    });

    test('should not be possible to update alias with new alias in used by other url', async () => {
      await expect(
        service.updateAlias(user.id, customAlias, customAlias),
      ).rejects.toThrow('Custom alias already taken');
    });

    test('should not be possible to update alias to a reserved word', async () => {
      await expect(
        service.updateAlias(user.id, customAlias, 'login'),
      ).rejects.toThrow('Invalid new alias');
    });

    test('should not be possible to update alias to a too short alias', async () => {
      await expect(
        service.updateAlias(user.id, customAlias, 'ab'),
      ).rejects.toThrow('Invalid new alias');
    });

    test('should not be possible to update alias to a too long alias', async () => {
      await expect(
        service.updateAlias(user.id, customAlias, 'a'.repeat(31)),
      ).rejects.toThrow('Invalid new alias');
    });

    test('should not be possible to update alias with invalid characters', async () => {
      await expect(
        service.updateAlias(user.id, customAlias, 'my alias!'),
      ).rejects.toThrow('Invalid new alias');
    });

    test('should not be possible to update alias with only whitespace', async () => {
      await expect(
        service.updateAlias(user.id, customAlias, '   '),
      ).rejects.toThrow('Invalid new alias');
    });
  });

  describe('delete url', async () => {
    test('should be possible to delete url', async () => {
      const url = await repoUrl.findByHash(customAlias);
      expect(url).toEqual(
        expect.objectContaining({
          userId: user.id,
        }),
      );
      await service.deleteUrl(user.id, customAlias);
      expect(await repoUrl.findByHash(customAlias)).toBeNull();
    });

    test('should invalidate the cache only after the database delete', async () => {
      const deleteSpy = vi.spyOn(repoUrl, 'deleteByUserIdAndHash');

      await service.deleteUrl(user.id, customAlias);

      expect(redisCacheUrlShortener.invalidate).toHaveBeenCalledWith(
        customAlias,
      );
      expect(deleteSpy.mock.invocationCallOrder[0]).toBeLessThan(
        vi.mocked(redisCacheUrlShortener.invalidate).mock
          .invocationCallOrder[0],
      );
    });

    test('should not invalidate the cache when the database delete fails', async () => {
      vi.spyOn(repoUrl, 'deleteByUserIdAndHash').mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.deleteUrl(user.id, customAlias)).rejects.toThrow(
        'db down',
      );
      expect(redisCacheUrlShortener.invalidate).not.toHaveBeenCalled();
    });

    test('should not be possible to delete url without user id', async () => {
      await expect(service.deleteUrl('', '')).rejects.toThrow(
        'Invalid user ID',
      );
    });

    test('should not be possible to delete url without hash', async () => {
      await expect(service.deleteUrl('123', '')).rejects.toThrow(
        'Invalid hash',
      );
    });

    test('should not be possible to delete url without existing user', async () => {
      await expect(service.deleteUrl('123', '123')).rejects.toThrow(
        'User not found',
      );
    });

    test('should not be possible to delete url without existing url', async () => {
      await expect(service.deleteUrl(user.id, '123')).rejects.toThrow(
        'URL not found for the user',
      );
    });
  });
});
