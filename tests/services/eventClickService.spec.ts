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
import { ClickEvent } from '../../src/repositories/interfaces/clickEventRepository';

describe('EventClickService', () => {
  let service: EventClickService;
  let repo: MockClickEventRepository;

  beforeEach(() => {
    repo = new MockClickEventRepository();
    service = new EventClickService(repo);
  });

  afterEach(() => {
    repo.reset();
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
});
