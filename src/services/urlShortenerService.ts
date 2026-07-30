import type { IUrlRepository } from '../repositories/interfaces/urlRepository';
import { isValidHash, isValidURLToBeShortener } from '../lib/validators';
import { generateHash } from '../lib/crypto';

const MAX_ATTEMPTS = 20;

export class UrlShortenerService {
  constructor(private readonly repo: IUrlRepository) {}

  async shorten(
    originalUrl: string,
    baseUrl: string,
    customAlias?: string,
    userId?: string,
  ): Promise<string> {
    if (!originalUrl) {
      throw new Error('Missing URL');
    }
    if (!isValidURLToBeShortener(originalUrl)) {
      throw new Error('Invalid URL');
    }

    if (customAlias !== undefined && userId !== undefined) {
      if (
        !customAlias ||
        typeof customAlias !== 'string' ||
        customAlias.trim() === ''
      ) {
        throw new Error('Invalid custom alias');
      }

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('Invalid user ID');
      }

      return await this.handleCustomAlias(
        originalUrl,
        baseUrl,
        customAlias,
        userId,
      );
    } else {
      return await this.handleRandomHash(originalUrl, baseUrl);
    }
  }

  async resolveShortenedUrl(hash: string): Promise<string> {
    if (!hash || !isValidHash(hash)) {
      throw new Error('Invalid hash');
    }

    const record = await this.repo.findByHash(hash);
    if (!record) {
      throw new Error('URL not found');
    }

    await this.repo.incrementClicks(hash);
    return record.original_url;
  }

  private async handleCustomAlias(
    originalUrl: string,
    baseUrl: string,
    customAlias: string,
    userId: string,
  ): Promise<string> {
    const existingRecord = await this.repo.findByCustomHash(customAlias);
    if (existingRecord) {
      throw new Error('Custom alias already taken');
    }

    await this.repo.createCustom(originalUrl, customAlias, userId);
    return `${baseUrl}/url/${customAlias}`;
  }

  private async handleRandomHash(
    originalUrl: string,
    baseUrl: string,
  ): Promise<string> {
    const existingRecord = await this.repo.findByOriginalUrl(originalUrl);
    if (existingRecord) {
      return `${baseUrl}/url/${existingRecord.hashed_url}`;
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const hash = generateHash();

      const existsHashRecord = await this.repo.findByHash(hash);

      if (!existsHashRecord) {
        await this.repo.createRandom(originalUrl, hash);
        return `${baseUrl}/url/${hash}`;
      }
    }

    throw new Error('Failed to generate unique hash after multiple attempts');
  }
}
