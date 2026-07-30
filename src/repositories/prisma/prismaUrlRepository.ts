import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../prisma/generated/client';
import type { IUrlRepository, UrlRecord } from '../interfaces/urlRepository';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export class PrismaUrlRepository implements IUrlRepository {
  async findByOriginalUrl(url: string): Promise<UrlRecord | null> {
    const data = await prisma.urlShortener.findFirst({
      where: {
        original_url: url,
      },
    });

    return data;
  }
  async findByHash(hash: string): Promise<UrlRecord | null> {
    const data = await prisma.urlShortener.findUnique({
      where: {
        hashed_url: hash,
      },
    });

    return data;
  }

  async findByCustomHash(custom_alias: string): Promise<UrlRecord | null> {
    const data = await prisma.urlShortener.findFirst({
      where: {
        hashed_url: custom_alias,
        userId: {
          not: null,
        },
      },
    });
    return data;
  }

  async createRandom(
    originalUrl: string,
    hashedUrl: string,
  ): Promise<UrlRecord> {
    const data = await prisma.urlShortener.create({
      data: {
        original_url: originalUrl,
        hashed_url: hashedUrl,
      },
    });

    return data;
  }

  async createCustom(
    originalUrl: string,
    custom_alias: string,
    user_id: string,
  ): Promise<UrlRecord> {
    const data = await prisma.urlShortener.create({
      data: {
        original_url: originalUrl,
        hashed_url: custom_alias,
        userId: user_id,
      },
    });

    return data;
  }

  async incrementClicks(hash: string): Promise<void> {
    try {
      await prisma.urlShortener.update({
        where: {
          hashed_url: hash,
        },
        data: {
          clicks: {
            increment: 1,
          },
          lastAccessed: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Record with hash ${hash} not found`, { cause: error });
    }
  }
}
