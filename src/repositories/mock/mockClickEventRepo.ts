import crypto from 'node:crypto';
import {
  IClickEventRepository,
  ClickEvent,
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
    };

    this.databaseInMemory.push(record);
    return record;
  }

  async getDataByHash(hash: string): Promise<ClickEvent[] | null> {
    return (
      this.databaseInMemory.filter(
        (click) => click.shortener_url_id === hash,
      ) ?? null
    );
  }

  // Helper for tests: reset state of the in-memory database
  reset(): void {
    this.databaseInMemory = [];
  }
}
