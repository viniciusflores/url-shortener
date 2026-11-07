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

  async countByHashes(hashes: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const click of this.databaseInMemory) {
      if (hashes.includes(click.shortener_url_id)) {
        counts.set(
          click.shortener_url_id,
          (counts.get(click.shortener_url_id) ?? 0) + 1,
        );
      }
    }
    return counts;
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
