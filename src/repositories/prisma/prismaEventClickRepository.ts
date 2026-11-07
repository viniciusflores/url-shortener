import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../prisma/generated/client';
import { DATABASE_URL } from '../../env';
import {
  ClickEvent,
  ClickEventRange,
  IClickEventRepository,
} from '../interfaces/clickEventRepository';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export class PrismaClickEventRepository implements IClickEventRepository {
  async create(
    shortenerUrlId: string,
    ip: string,
    userAgent: string,
  ): Promise<ClickEvent> {
    const data = await prisma.clickEvent.create({
      data: {
        shortener_url_id: shortenerUrlId,
        ip: ip,
        userAgent: userAgent,
      },
    });

    return data;
  }

  async getDataByHash(
    hash: string,
    range: ClickEventRange = {},
  ): Promise<ClickEvent[] | null> {
    const data = await prisma.clickEvent.findMany({
      where: {
        shortener_url_id: hash,
        createdAt: { gte: range.from, lt: range.to },
      },
      orderBy: { createdAt: 'asc' },
    });

    return data;
  }
}
