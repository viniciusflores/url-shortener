import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createUrl = async (original_url, hashed_url) => {
  const data = await prisma.urlShortener.create({
    data: {
      original_url,
      hashed_url,
    },
  });

  return data;
};

const getByUrl = async (original_url) => {
  const data = await prisma.urlShortener.findFirst({
    where: {
      original_url,
    },
  });

  return data;
};

const getByHash = async (hash) => {
  const data = await prisma.urlShortener.findFirst({
    where: {
      hashed_url: hash,
    },
  });

  return data;
};

export { createUrl, getByHash, getByUrl };
