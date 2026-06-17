import type { IUrlRepository } from '../repositories/interfaces/urlRepository';
import { isValidURL } from '../utils/urlValidator';
import { generateHash, isValidHash } from '../utils/hashUtils';

const MAX_ATTEMPTS = 20;
export class UrlShortenerService {
  constructor(private readonly repo: IUrlRepository) {}

  async shorten(originalUrl: string, baseUrl: string): Promise<string> {
    if (!originalUrl) {
      throw new Error('Missing URL');
    }
    if (!isValidURL(originalUrl)) {
      throw new Error('Invalid URL');
    }

    const existPreviousRecord = await this.repo.findByOriginalUrl(originalUrl);
    if (existPreviousRecord) {
      return `${baseUrl}/url/${existPreviousRecord.hashed_url}`;
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const hash = generateHash();

      const existHashRecord = await this.repo.findByHash(hash);

      if (!existHashRecord) {
        await this.repo.create(originalUrl, hash);
        return `${baseUrl}/url/${hash}`;
      }
    }

    throw new Error('Failed to generate unique hash after multiple attempts');
  }

  async resolveShortenedUrl(hash: string): Promise<string> {
    if (!hash || !isValidHash(hash)) {
      return '';
    }

    const record = await this.repo.findByHash(hash);
    if (!record) {
      throw new Error('URL not found');
    }
    return record.original_url;
  }
}
