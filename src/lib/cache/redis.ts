import Redis from 'ioredis';
import { REDIS_URL } from '../../env';
import { logger } from '../logger';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week

const redis = new Redis(REDIS_URL);

/* c8 ignore start */
redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.info('Redis error', err));
/* c8 ignore stop */
interface CachedUrlShortener {
  original_url: string;
  expiresAt: Date;
}

interface itemCachedUrlShortener {
  hash: string;
  original_url: string;
  expiresAt: Date;
}

export const redisCacheUrlShortener = {
  async get(hash: string): Promise<CachedUrlShortener | null> {
    const raw = await redis.get(hash);
    return raw ? JSON.parse(raw) : null;
  },

  async set({
    hash,
    original_url,
    expiresAt,
  }: itemCachedUrlShortener): Promise<void> {
    await redis.set(
      hash,
      JSON.stringify({
        original_url: original_url,
        expiresAt: expiresAt.toISOString(),
      }),
      'EX',
      CACHE_TTL_SECONDS,
    );
  },

  async invalidate(hash: string): Promise<void> {
    await redis.del(hash);
  },
};
