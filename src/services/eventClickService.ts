import { BadRequestError, NotFoundError } from '../lib/errors';
import { isValidISODate } from '../lib/validators';
import { addUTCDays, getStartOfUTCDay } from '../lib/date/utils';
import {
  IClickEventRepository,
  ClickEvent,
} from '../repositories/interfaces/clickEventRepository';
import type { IUrlRepository } from '../repositories/interfaces/urlRepository';

export interface UrlAnalytics {
  hash: string;
  totalClicks: number;
  clicksByDay: { date: string; clicks: number }[];
}

export class EventClickService {
  constructor(
    private readonly repo: IClickEventRepository,
    private readonly urlRepo: IUrlRepository,
  ) {}

  async insert(
    shortenerUrlId: string,
    ip: string,
    userAgent: string,
  ): Promise<ClickEvent> {
    if (
      !shortenerUrlId ||
      typeof shortenerUrlId !== 'string' ||
      shortenerUrlId.trim() === ''
    ) {
      throw new BadRequestError('ShortenerUrlId is not valid');
    }

    const click = await this.repo.create(shortenerUrlId, ip, userAgent);
    return click;
  }

  async getByHash(hash: string): Promise<ClickEvent[] | []> {
    if (!hash || typeof hash !== 'string' || hash.trim() === '') {
      throw new BadRequestError('hash url is not valid');
    }

    const data = await this.repo.getDataByHash(hash);
    if (!data) {
      return [];
    }

    return data;
  }

  async getAnalytics(
    userId: string,
    hash: string,
    from?: string,
    to?: string,
  ): Promise<UrlAnalytics> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError('Invalid user ID');
    }
    if (!hash || typeof hash !== 'string' || hash.trim() === '') {
      throw new BadRequestError('hash url is not valid');
    }
    if (from !== undefined && !isValidISODate(from)) {
      throw new BadRequestError('Invalid from date, expected YYYY-MM-DD');
    }
    if (to !== undefined && !isValidISODate(to)) {
      throw new BadRequestError('Invalid to date, expected YYYY-MM-DD');
    }
    if (from && to && from > to) {
      throw new BadRequestError('from date must be before to date');
    }

    const url = await this.urlRepo.findByUserIdAndHash(userId, hash);
    if (!url) {
      throw new NotFoundError('Url not found');
    }

    const events =
      (await this.repo.getDataByHash(hash, {
        from: from ? getStartOfUTCDay(from) : undefined,
        to: to ? addUTCDays(getStartOfUTCDay(to), 1) : undefined,
      })) ?? [];

    const counts = new Map<string, number>();
    for (const event of events) {
      const day = event.createdAt.toISOString().slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    const clicksByDay = [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, clicks]) => ({ date, clicks }));

    return { hash, totalClicks: events.length, clicksByDay };
  }
}
