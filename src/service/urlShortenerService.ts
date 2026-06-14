import { PrismaClient } from '../../prisma/generated/client';
import type { UrlShortener } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const createUrl = async (
  original_url: string,
  hashed_url: string,
): Promise<UrlShortener> => {
  const data = await prisma.urlShortener.create({
    data: {
      original_url,
      hashed_url,
    },
  });

  return data;
};

const getByUrl = async (original_url: string): Promise<UrlShortener | null> => {
  const data = await prisma.urlShortener.findFirst({
    where: {
      original_url,
    },
  });

  return data;
};

const getByHash = async (hash: string): Promise<UrlShortener | null> => {
  const data = await prisma.urlShortener.findFirst({
    where: {
      hashed_url: hash,
    },
  });

  return data;
};

export { createUrl, getByHash, getByUrl };
