import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../prisma/generated/client';
import type { IUrlRepository, UrlRecord } from '../interfaces/urlRepository';
import { DATABASE_URL } from '../../env';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
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

  async findByUserId(userId: string): Promise<UrlRecord[]> {
    const data = await prisma.urlShortener.findMany({
      where: {
        userId: userId,
      },
    });

    return data;
  }

  async findByUserIdAndHash(
    userId: string,
    hash: string,
  ): Promise<UrlRecord | null> {
    const data = await prisma.urlShortener.findFirst({
      where: {
        userId: userId,
        hashed_url: hash,
      },
    });

    return data;
  }

  async updateAlias(
    userId: string,
    hash: string,
    newAlias: string,
  ): Promise<UrlRecord> {
    try {
      const data = await prisma.urlShortener.update({
        where: {
          userId: userId,
          hashed_url: hash,
        },
        data: {
          hashed_url: newAlias,
        },
      });
      return data;
    } catch (error) {
      throw new Error(
        `Failed to update alias for hash ${hash} and user ${userId}`,
        { cause: error },
      );
    }
  }

  async deleteByUserIdAndHash(userId: string, hash: string): Promise<void> {
    try {
      await prisma.urlShortener.deleteMany({
        where: {
          userId: userId,
          hashed_url: hash,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete record with hash ${hash} for user ${userId}`,
        { cause: error },
      );
    }
  }
}
