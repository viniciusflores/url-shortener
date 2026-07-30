export interface UrlRecord {
  original_url: string;
  hashed_url: string;
  clicks: number;
  lastAccessed: Date | null;
  userId: string | null;
}

export interface IUrlRepository {
  findByOriginalUrl(url: string): Promise<UrlRecord | null>;
  findByHash(hash: string): Promise<UrlRecord | null>;
  findByCustomHash(custom_alias: string): Promise<UrlRecord | null>;
  createRandom(originalUrl: string, hashedUrl: string): Promise<UrlRecord>;
  createCustom(
    originalUrl: string,
    custom_alias: string,
    user_id: string,
  ): Promise<UrlRecord>;
  incrementClicks(hash: string): Promise<void>;
}
