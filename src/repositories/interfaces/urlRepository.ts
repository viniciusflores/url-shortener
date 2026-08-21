export interface UrlRecord {
  original_url: string;
  hashed_url: string;
  clicks: number;
  lastAccessed: Date | null;
  userId: string | null;
  expiresAt: Date | null;
}

export interface IUrlRepository {
  findByOriginalUrl(url: string): Promise<UrlRecord | null>;
  findByHash(hash: string): Promise<UrlRecord | null>;
  createRandom(originalUrl: string, hashedUrl: string): Promise<UrlRecord>;
  createCustom(
    originalUrl: string,
    custom_alias: string,
    user_id: string,
  ): Promise<UrlRecord>;
  incrementClicks(hash: string): Promise<void>;
  findByUserId(userId: string): Promise<UrlRecord[]>;
  findByUserIdAndHash(userId: string, hash: string): Promise<UrlRecord | null>;
  updateAlias(
    userId: string,
    hash: string,
    newAlias: string,
  ): Promise<UrlRecord>;
  deleteByUserIdAndHash(userId: string, hash: string): Promise<void>;
}
