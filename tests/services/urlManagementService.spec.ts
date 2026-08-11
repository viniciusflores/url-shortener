import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { UserRecord } from '../../src/repositories/interfaces/userRepository';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { MockUserRepository } from '../../src/repositories/mock/mockUserRepo';
import { UrlManagementService } from '../../src/services/urlManagementService';

describe('UrlManagementService', () => {
  let service: UrlManagementService;
  let repoUrl: MockUrlRepository;
  let repoUsers: MockUserRepository;
  const user_default = 'email@email.com';
  const password_hashed_default = '1234567890';
  let user: UserRecord;
  let originalUrl: string;
  let customAlias: string;
  let newCustomAlias: string;

  beforeEach(async () => {
    repoUrl = new MockUrlRepository();
    repoUsers = new MockUserRepository();
    service = new UrlManagementService(repoUrl, repoUsers);
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
