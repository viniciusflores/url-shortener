import crypto from 'node:crypto';
import {
  IClickEventRepository,
  ClickEvent,
  ClickEventRange,
} from '../interfaces/clickEventRepository';

export class MockClickEventRepository implements IClickEventRepository {
  private databaseInMemory: ClickEvent[] = [];

  async create(
    shortenerUrlId: string,
    ip: string,
    userAgent: string,
  ): Promise<ClickEvent> {
    const record = {
      id: crypto.randomUUID(),
      shortener_url_id: shortenerUrlId,
      ip,
      userAgent,
      createdAt: new Date(),
    };

    this.databaseInMemory.push(record);
    return record;
  }

  async getDataByHash(
    hash: string,
    range: ClickEventRange = {},
  ): Promise<ClickEvent[] | null> {
    const { from, to } = range;
    return this.databaseInMemory
      .filter(
        (click) =>
          click.shortener_url_id === hash &&
          (!from || click.createdAt.getTime() >= from.getTime()) &&
          (!to || click.createdAt.getTime() < to.getTime()),
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Helper for tests: reset state of the in-memory database
  reset(): void {
    this.databaseInMemory = [];
  }
}
