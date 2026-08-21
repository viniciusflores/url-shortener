import type { IUrlRepository, UrlRecord } from '../interfaces/urlRepository';
import {
  getExpiryDatePlusOneYear,
  getExpiryDatePlusTwoYears,
} from '../../lib/date/utils';

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

  async createRandom(
    originalUrl: string,
    hashedUrl: string,
  ): Promise<UrlRecord> {
    const record: UrlRecord = {
      original_url: originalUrl,
      hashed_url: hashedUrl,
      clicks: 0,
      lastAccessed: null,
      userId: null,
      expiresAt: getExpiryDatePlusOneYear(),
    };
    this.databaseInMemory.push(record);
    return record;
  }

  async createCustom(
    originalUrl: string,
    custom_alias: string,
    user_id: string,
  ): Promise<UrlRecord> {
    const record: UrlRecord = {
      original_url: originalUrl,
      hashed_url: custom_alias,
      clicks: 0,
      lastAccessed: null,
      userId: user_id,
      expiresAt: getExpiryDatePlusTwoYears(),
    };
    this.databaseInMemory.push(record);
    return record;
  }

  async incrementClicks(hash: string): Promise<void> {
    const record = this.databaseInMemory.find(
      (data) => data.hashed_url === hash,
    );

    if (!record) {
      const prismaError = new Error('Record not found');
      throw new Error(`Record with hash ${hash} not found`, {
        cause: prismaError,
      });
    }

    record.clicks += 1;
    record.lastAccessed = new Date();
  }

  async findByUserId(userId: string): Promise<UrlRecord[]> {
    return this.databaseInMemory.filter((data) => data.userId === userId);
  }
  async findByUserIdAndHash(
    userId: string,
    hash: string,
  ): Promise<UrlRecord | null> {
    return (
      this.databaseInMemory.find(
        (data) => data.userId === userId && data.hashed_url === hash,
      ) ?? null
    );
  }
  async updateAlias(
    userId: string,
    hash: string,
    newAlias: string,
  ): Promise<UrlRecord> {
    const record = this.databaseInMemory.find(
      (data) => data.userId === userId && data.hashed_url === hash,
    );

    if (!record) {
      const prismaError = new Error('Record not found');
      throw new Error(`Record with hash ${hash} not found for user ${userId}`, {
        cause: prismaError,
      });
    }

    record.hashed_url = newAlias;
    record.expiresAt = getExpiryDatePlusTwoYears();
    return record;
  }

  async deleteByUserIdAndHash(userId: string, hash: string): Promise<void> {
    const record = this.databaseInMemory.find(
      (data) => data.userId === userId && data.hashed_url === hash,
    );

    if (!record) {
      const prismaError = new Error('Record not found');
      throw new Error(`Record with hash ${hash} not found for user ${userId}`, {
        cause: prismaError,
      });
    }

    this.databaseInMemory = this.databaseInMemory.filter(
      (data) => !(data.userId === userId && data.hashed_url === hash),
    );
  }

  // Helper for tests: reset state of the in-memory database
  reset(): void {
    this.databaseInMemory = [];
  }
}
