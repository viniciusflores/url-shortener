import {
  describe,
  test,
  beforeEach,
  expect,
  afterEach,
  expectTypeOf,
  vi,
} from 'vitest';
import { EventClickService } from '../../src/services/eventClickService';
import { MockClickEventRepository } from '../../src/repositories/mock/mockClickEventRepo';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { ClickEvent } from '../../src/repositories/interfaces/clickEventRepository';

describe('EventClickService', () => {
  let service: EventClickService;
  let repo: MockClickEventRepository;
  let urlRepo: MockUrlRepository;

  beforeEach(() => {
    repo = new MockClickEventRepository();
    urlRepo = new MockUrlRepository();
    service = new EventClickService(repo, urlRepo);
  });

  afterEach(() => {
    repo.reset();
    vi.useRealTimers();
  });

  describe('create event click', async () => {
    test('should be possible to create event click', async () => {
      const click = {
        shortenerUrlId: 'H8jVF7NhsA=@',
        ip: '192.168.0.0',
        userAgent: 'Chrome 123',
      };

      const item = await service.insert(
        click.shortenerUrlId,
        click.ip,
        click.userAgent,
      );
      expectTypeOf(item).toExtend<ClickEvent>();
      expect(item.id).toBeTypeOf('string');
      expect(item.shortener_url_id).toBe(click.shortenerUrlId);
      expect(item.ip).toBe(click.ip);
      expect(item.userAgent).toBe(click.userAgent);
    });

    test('should not be possible to create event click without shortener url id', async () => {
      await expect(service.insert('', '', '')).rejects.toThrow(
        'ShortenerUrlId is not valid',
      );
    });

    test('should be possible to create event click with blank ip', async () => {
      const data = await service.insert('abcdef123', '', '');
      expectTypeOf(data).toExtend<ClickEvent>();
    });

    test('should be possible to create event click with blank user agent', async () => {
      const data = await service.insert('abcdef123', '192.168.0.0', '');
      expectTypeOf(data).toExtend<ClickEvent>();
    });
  });

  describe('find event click by url', async () => {
    test('should be possible to get event click by url', async () => {
      const click = {
        shortenerUrlId: 'H8jVF7NhsA=@',
        ip: '192.168.0.0',
        userAgent: 'Chrome 123',
      };
      await repo.create(click.shortenerUrlId, click.ip, click.userAgent);

      const response = await service.getByHash(click.shortenerUrlId);
      expectTypeOf(response).toExtend<ClickEvent[]>();
      expect(response[0].shortener_url_id).toBe(click.shortenerUrlId);
      expect(response[0].ip).toBe(click.ip);
      expect(response[0].userAgent).toBe(click.userAgent);
    });

    test('should not be possible to get event click by url without url', async () => {
      await expect(service.getByHash('')).rejects.toThrow(
        'hash url is not valid',
      );
      await expect(service.getByHash(null as any)).rejects.toThrow(
        'hash url is not valid',
      );
      await expect(service.getByHash(undefined as any)).rejects.toThrow(
        'hash url is not valid',
      );
    });

    test('should be return empty array when not found event click', async () => {
      vi.spyOn(repo, 'getDataByHash').mockResolvedValueOnce(null);

      const data = await service.getByHash('1234567890');
      expect(data).toBeInstanceOf(Array);
      expect(data).toHaveLength(0);
    });
  });

  describe('get url analytics', () => {
    const ownerId = 'owner-user-id';
    const alias = 'my-alias';

    const clickAt = async (iso: string, hash = alias) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(iso));
      await repo.create(hash, '192.168.0.1', 'Chrome 123');
      vi.useRealTimers();
    };

    beforeEach(async () => {
      await urlRepo.createCustom('https://example.com', alias, ownerId);
    });

    test('should return total clicks grouped by day', async () => {
      await clickAt('2026-11-01T10:00:00.000Z');
      await clickAt('2026-11-01T23:59:59.999Z');
      await clickAt('2026-11-03T00:00:00.000Z');
      await clickAt('2026-11-03T00:00:00.000Z', 'other-hash');

      const analytics = await service.getAnalytics(ownerId, alias);

      expect(analytics).toEqual({
        hash: alias,
        totalClicks: 3,
        clicksByDay: [
          { date: '2026-11-01', clicks: 2 },
          { date: '2026-11-03', clicks: 1 },
        ],
      });
    });

    test('should filter clicks by date range including both days', async () => {
      await clickAt('2026-10-31T23:59:59.999Z');
      await clickAt('2026-11-01T00:00:00.000Z');
      await clickAt('2026-11-02T23:59:59.999Z');
      await clickAt('2026-11-03T00:00:00.000Z');

      const analytics = await service.getAnalytics(
        ownerId,
        alias,
        '2026-11-01',
        '2026-11-02',
      );

      expect(analytics.totalClicks).toBe(2);
      expect(analytics.clicksByDay).toEqual([
        { date: '2026-11-01', clicks: 1 },
        { date: '2026-11-02', clicks: 1 },
      ]);
    });

    test('should filter clicks of a single day when from and to are equal', async () => {
      await clickAt('2026-11-01T10:00:00.000Z');
      await clickAt('2026-11-02T10:00:00.000Z');

      const analytics = await service.getAnalytics(
        ownerId,
        alias,
        '2026-11-01',
        '2026-11-01',
      );

      expect(analytics.totalClicks).toBe(1);
    });

    test('should return zero clicks when url has no clicks', async () => {
      const analytics = await service.getAnalytics(ownerId, alias);
      expect(analytics).toEqual({
        hash: alias,
        totalClicks: 0,
        clicksByDay: [],
      });
    });

    test('should not return analytics of a url owned by another user', async () => {
      await clickAt('2026-11-01T10:00:00.000Z');

      await expect(
        service.getAnalytics('another-user-id', alias),
      ).rejects.toThrow('Url not found');
    });

    test('should throw not found when url does not exist', async () => {
      await expect(
        service.getAnalytics(ownerId, 'does-not-exist'),
      ).rejects.toThrow('Url not found');
    });

    test('should reject invalid user id or hash', async () => {
      await expect(service.getAnalytics('', alias)).rejects.toThrow(
        'Invalid user ID',
      );
      await expect(service.getAnalytics(ownerId, '')).rejects.toThrow(
        'hash url is not valid',
      );
    });

    test('should reject invalid dates', async () => {
      await expect(
        service.getAnalytics(ownerId, alias, '01-11-2026'),
      ).rejects.toThrow('Invalid from date, expected YYYY-MM-DD');
      await expect(
        service.getAnalytics(ownerId, alias, undefined, '2026-02-30'),
      ).rejects.toThrow('Invalid to date, expected YYYY-MM-DD');
    });

    test('should reject a range where from is after to', async () => {
      await expect(
        service.getAnalytics(ownerId, alias, '2026-11-02', '2026-11-01'),
      ).rejects.toThrow('from date must be before to date');
    });
  });
});
