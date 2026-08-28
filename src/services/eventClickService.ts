import { BadRequestError } from '../lib/errors';
import {
  IClickEventRepository,
  ClickEvent,
} from '../repositories/interfaces/clickEventRepository';

export class EventClickService {
  constructor(private readonly repo: IClickEventRepository) {}

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
}
