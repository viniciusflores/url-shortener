import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../prisma/generated/client';
import type { UrlShortener } from '../../../prisma/generated/client';
import type { IUrlRepository } from '../interfaces/urlRepository';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export class PrismaUrlRepository implements IUrlRepository {
  async findByOriginalUrl(url: string): Promise<UrlShortener | null> {
    const data = await prisma.urlShortener.findUnique({
      where: {
        original_url: url,
      },
    });

    return data;
  }
  async findByHash(hash: string): Promise<UrlShortener | null> {
    const data = prisma.urlShortener.findUnique({
      where: {
        hashed_url: hash,
      },
    });

    return data;
  }
  async create(originalUrl: string, hashedUrl: string): Promise<UrlShortener> {
    const data = await prisma.urlShortener.create({
      data: {
        original_url: originalUrl,
        hashed_url: hashedUrl,
      },
    });

    return data;
  }
}
