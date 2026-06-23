export interface UrlRecord {
  original_url: string;
  hashed_url: string;
}

export interface IUrlRepository {
  findByOriginalUrl(url: string): Promise<UrlRecord | null>;
  findByHash(hash: string): Promise<UrlRecord | null>;
  create(originalUrl: string, hashedUrl: string): Promise<UrlRecord>;
}
