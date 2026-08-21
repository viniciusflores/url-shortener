import type { IUrlRepository } from '../repositories/interfaces/urlRepository';
import {
  isValidHash,
  isValidURLToBeShortener,
  isValidCustomAlias,
} from '../lib/validators';
import { generateHash } from '../lib/crypto';
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ResourcePermanentlyRemovedError,
} from '../lib/errors';
import { BASE_URL } from '../env';
import { isExpired } from '../lib/date/utils';
const MAX_ATTEMPTS = 20;

export class UrlShortenerService {
  constructor(private readonly repo: IUrlRepository) {}

  async shorten(
    originalUrl: string,
    customAlias?: string,
    userId?: string,
  ): Promise<string> {
    if (!originalUrl) {
      throw new BadRequestError('Missing URL');
    }
    if (!isValidURLToBeShortener(originalUrl)) {
      throw new BadRequestError('Invalid URL');
    }

    if (customAlias !== undefined && userId !== undefined) {
      if (
        !customAlias ||
        typeof customAlias !== 'string' ||
        customAlias.trim() === '' ||
        !isValidCustomAlias(customAlias)
      ) {
        throw new BadRequestError('Invalid custom alias');
      }

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new BadRequestError('Invalid user ID');
      }
      return await this.handleCustomAlias(originalUrl, customAlias, userId);
    } else {
      return await this.handleRandomHash(originalUrl);
    }
  }

  async resolveShortenedUrl(hash: string): Promise<string> {
    if (!hash || !isValidHash(hash)) {
      throw new BadRequestError('Invalid hash format provided');
    }

    const record = await this.repo.findByHash(hash);
    if (!record) {
      throw new NotFoundError('URL not found');
    }

    if (record.expiresAt && isExpired(record.expiresAt)) {
      throw new ResourcePermanentlyRemovedError();
    }

    await this.repo.incrementClicks(hash);
    return record.original_url;
  }

  private async handleCustomAlias(
    originalUrl: string,
    customAlias: string,
    userId: string,
  ): Promise<string> {
    const existingRecord = await this.repo.findByHash(customAlias);
    if (existingRecord) {
      throw new BadRequestError('Custom alias already taken');
    }

    await this.repo.createCustom(originalUrl, customAlias, userId);
    return `${BASE_URL}/url/${customAlias}`;
  }

  private async handleRandomHash(originalUrl: string): Promise<string> {
    const existingRecord = await this.repo.findByOriginalUrl(originalUrl);
    if (existingRecord) {
      const hash = existingRecord.hashed_url;
      await this.repo.updateExpiresAtInOneYear(hash);
      return `${BASE_URL}/url/${existingRecord.hashed_url}`;
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const hash = generateHash();

      const existsHashRecord = await this.repo.findByHash(hash);

      if (!existsHashRecord) {
        await this.repo.createRandom(originalUrl, hash);
        return `${BASE_URL}/url/${hash}`;
      }
    }

    throw new AppError(
      500,
      'Failed to generate unique hash after multiple attempts',
    );
  }
}
