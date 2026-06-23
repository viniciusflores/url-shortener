import type { IUrlRepository, UrlRecord } from '../interfaces/urlRepository';

export class MockUrlRepository implements IUrlRepository {
  private databaseInMemory: UrlRecord[] = [];

  async findByOriginalUrl(url: string): Promise<UrlRecord | null> {
    return (
      this.databaseInMemory.find((data) => data.original_url === url) ?? null
    );
  }

  async findByHash(hash: string): Promise<UrlRecord | null> {
    return (
      this.databaseInMemory.find((data) => data.hashed_url === hash) ?? null
    );
  }

  async create(originalUrl: string, hashedUrl: string): Promise<UrlRecord> {
    const record: UrlRecord = {
      original_url: originalUrl,
      hashed_url: hashedUrl,
    };
    this.databaseInMemory.push(record);
    return record;
  }

  // Helper for tests: reset state of the in-memory database
  reset(): void {
    this.databaseInMemory = [];
  }
}
